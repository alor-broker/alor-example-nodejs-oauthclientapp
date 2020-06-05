const cors = require('cors'),
      express = require('express'),
      app = express(),
      simpleOAuth = require('simple-oauth2');

const credentialsAlor = {
  client: {
    // Идентификатор приложения. Может считаться публичной информацией.
    id: 'application_id', 
    // Секретный ключ приложения. Должен считаться приватной информацией.
    secret: 'secret_key', 
  },
  auth: {
    // Для боевого контура httpS://oauth.alor.ru
    tokenHost: 'https://oauthdev.alor.ru',
    tokenPath: '/token',
    authorizePath: '/authorize',
  }
};

const OAuth2 = simpleOAuth.create(credentialsAlor);
// CORS на все домены, пожалуйста не забудьте удалить или настройть по необходимости
app.use(cors()); 

const redirect_uri = 'http://127.0.0.1:3001/callback';

app.get('/', function (req, res) {
  let state = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 15; i++) {
    state += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  authorization_uri = OAuth2.authorizationCode.authorizeURL({
    // Тот же URL, который вы указывали при создании приложения. На бою - обязательно httpS
    redirect_uri, 
    // Права, которые требуются вашему приложению для функционирования
    scope: 'ordersread orderscreate trades personal stats',
    // Состояние, с помощью которого вы сможете определить клиента вернувшегося по редиректу
    state
  });

  const tpl = `
    <html>
      <body>
        <h4>OAuth client app example</h4>
        <a href="${authorization_uri}">Connect to Alor</a>
      </body>
    </html>
  `;

  res.send(tpl);
});

// Колбэк, который получает токены по коду авторизации
app.get('/callback', async function (req, res) {
  if(req.query.error){
      res.send(req.query.error);
      return;
  }
  const code = req.query.code;
  const tokenConfig = {
      code,
      // Опять же, на бою обязательно httpS
      redirect_uri,
      client_id: credentialsAlor.client.id,
      client_secret: credentialsAlor.client.secret
    };

  try {
    const result = await OAuth2.authorizationCode.getToken(tokenConfig);
    const tokenResp = OAuth2.accessToken.create(result);

    const tpl = `
      <html>
        <body>
          <h4>Ouath client app example</h4>
          <p><b>Success</b></p>
          <p>Acess Token: ${tokenResp.token.access_token}</p>
          <p>Refresh Token: ${tokenResp.token.refresh_token}</p>
        </body>
      </html>
    `;

    res.send(tpl);
  } catch (error) {
    res.send('Access Token Error', error.message);
  }
});

app.listen(3001);
console.log('OAuth Client started on port 3001');
