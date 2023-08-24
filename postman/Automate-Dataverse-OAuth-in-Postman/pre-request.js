// Refresh OAuth token if it has expired.
// Modified from https://medium.com/@allen.helton/how-to-automate-oauth2-token-renewal-in-postman-864420d381a0

var tokenDate = new Date(2010,1,1);
var tokenTimestamp = pm.environment.get('_oauthTimestamp');
if (tokenTimestamp) {
    tokenDate = Date.parse(tokenTimestamp);
}

var expiresInTime = pm.environment.get('_expiresInTime');
if (!expiresInTime) {
    expiresInTime = 300000; // Set default expiration time to 5 minutes
}

if ((new Date() - tokenDate) >= expiresInTime) 
{
    var unencodedAuth = pm.environment.get('clientId') + ':' + pm.environment.get('clientSecret');
    var encodedAuth = 'Basic ' + btoa(unencodedAuth);
    var scope = pm.environment.get('dataverseBase') + '/.default';
    pm.sendRequest({
        url:  pm.environment.get('authUrl'), 
        method: 'POST',
        header: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': encodedAuth
        },
        body: 'grant_type=client_credentials&scope=' + encodeURIComponent(scope)
    }, function (err, res) {
        var responseBody = res.json();
        pm.environment.set('_oauthToken', responseBody.access_token);
        pm.environment.set('_oauthTimestamp', new Date());
        
        // Set the ExpiresInTime variable to the time given in the response if it exists
        if (responseBody.expires_in) {
            expiresInTime = responseBody.expires_in * 1000;
        }
        pm.environment.set('_expiresInTime', expiresInTime);
    });
}