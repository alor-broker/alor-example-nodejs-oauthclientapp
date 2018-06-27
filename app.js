var cors = require('cors')
var request = require('request');
var path = require('path');
var express = require('express'),
    app = express();

var OAuth2;

app.use(cors())

var credentialsAlor = {
    client: {
        id: "8576e3ed958840efac64",
        secret: "Twy+YPIW3BaQId3PcMv7yF91hkGv0AGxRNpNcUUaTBg=",
      },
      auth: {
        tokenHost: 'http://oauth.dev.alor.ru',
        tokenPath: '/token',
        authorizePath: '/authorize',
      }
};

app.get('/', function(request, response){
    var state = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 15; i++) {
        state += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    
    OAuth2 = require('simple-oauth2').create(credentialsAlor);
    authorization_uri = OAuth2.authorizationCode.authorizeURL({
        redirect_uri: 'http://10.85.85.56:3001/callback',
        scope: 'ordersread trades personal trades',
        state: state
    });
    const tpl = `
    <html>
        <h4>Ouath client app example</h4>
        <form>
            <button><a href="${authorization_uri}">Connect to Alor</a></button>
            <!--<button formaction="${authorization_uri}">Connect to Alor</button>-->
        </form>
    </html>
    `;
    response.send(tpl);
});

// Callback endpoint parsing the authorization token and asking for the access token
app.get('/callback', async function (req, res) {
    var code = req.query.code;
    const tokenConfig = {
        code: code,
        redirect_uri: 'http://10.85.85.56:3001/callback',
        client_id: credentialsAlor.client.id
      };

      try {
        const result = await OAuth2.authorizationCode.getToken(tokenConfig);
        const tokenResp = OAuth2.accessToken.create(result);
        console.log(tokenResp.token.access_token);
        const tpl = `
        <html>
            <h4>Ouath client app example</h4>
            <p><b>Success</b></p>
            <p>Acess Token: ${tokenResp.token.access_token}</p
            <p>Refresh Token: ${tokenResp.token.refresh_token}</p
        </html>
        `;
        res.send(tpl);

      } catch (error) {
        res.send('Access Token Error', error.message);
      }
});

app.listen(3001);
 
console.log("OAuth Client started on port 3001");