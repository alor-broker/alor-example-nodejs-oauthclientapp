var request = require('request');
var path = require('path');
var express = require('express'),
    app = express();

var OAuth2;

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
        redirect_uri: 'http://localhost:3001/callback',
        scope: 'orders trades personal trading',
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
app.get('/callback', function (req, res) {
    var code = req.query.code;
 
    OAuth2.AuthCode.getToken({
        code: code,
        redirect_uri: 'http://localhost:3001/callback'
    }, saveToken);
 
    function saveToken(error, result) {
        if (error) {
            console.log('Access Token Error', error.message, error);
            res.json({'Access Token Error': error.message});
        } else {
            //see what we've got...
            console.log(result);
            //this adds the expiry time to the token by adding the validity time to the token
            token = OAuth2.AccessToken.create(result);
            //save the response back from the token endpoint in a session
            req.session.token = result;
 
            //perform the res of the processing now that we have an Access Token
            gotToken(req,res);
        }
    }

    //Now the token has been received and saved in the session, return the next page for processing
    function gotToken(req, res) {
        res.sendfile(__dirname +"/public/main.html");
    };
 
});
 
app.listen(3001);
 
console.log("OAuth Client started on port 3001");