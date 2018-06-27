const cors = require('cors'),
      express = require('express'),
      app = express(),
      simpleOAuth = require('simple-oauth2');

const credentialsAlor = {
  client: {
      id: '8576e3ed958840efac64',
      secret: 'Twy+YPIW3BaQId3PcMv7yF91hkGv0AGxRNpNcUUaTBg=',
    },
    auth: {
      tokenHost: 'http://oauth.dev.alor.ru',
      tokenPath: '/token',
      authorizePath: '/authorize',
    }
};

const OAuth2 = simpleOAuth.create(credentialsAlor);

app.use(cors());

app.get('/', function (req, res) {
  let state = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 15; i++) {
    state += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  authorization_uri = OAuth2.authorizationCode.authorizeURL({
    redirect_uri: 'http://10.85.85.56:3001/callback',
    scope: 'ordersread trades personal trades',
    state
  });

  const tpl = `
    <html>
      <body>
        <h4>Ouath client app example</h4>
        <a href="${authorization_uri}">Connect to Alor</a>
      </body>
    </html>
  `;

  res.send(tpl);
});

// Callback endpoint parsing the authorization token and asking for the access token
app.get('/callback', async function (req, res) {
  const code = req.query.code;
  const tokenConfig = {
      code,
      redirect_uri: 'http://10.85.85.56:3001/callback',
      client_id: credentialsAlor.client.id
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
