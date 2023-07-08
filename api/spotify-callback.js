import axios from 'axios';
import qs from 'querystring';

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

export default async function callback(req, res) {
  const { code, refresh_token } = req.query;

  if (refresh_token) {
    // Use refresh token to get a new access token
    const refreshOptions = {
      url: 'https://accounts.spotify.com/api/token',
      method: 'post',
      data: qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
      }),
      headers: {
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    try {
      const response = await axios(refreshOptions);
      const { access_token } = response.data;

      // Redirect the user to the home page with the new access token
      res.writeHead(302, { Location: process.env.HOME_PAGE + `/?access_token=${access_token}&refresh_token=${refresh_token}` });
      res.end();
    } catch (error) {
      console.error(error);
      res.status(500).send('Refresh token failed');
    }
  } else if (code) {
    // Exchange authorization code for access token and refresh token
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      method: 'post',
      data: qs.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
      headers: {
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    try {
      const response = await axios(authOptions);
      const { access_token, refresh_token } = response.data;

      // Redirect the user to the home page with access token and refresh token
      res.writeHead(302, { Location: process.env.HOME_PAGE + `/?access_token=${access_token}&refresh_token=${refresh_token}` });
      res.end();
    } catch (error) {
      console.error(error);
      res.status(500).send('Authentication failed');
    }
  }
}
