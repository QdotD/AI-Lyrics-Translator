import axios from 'axios';

export default async function currentlyPlaying(req, res) {
  const { access_token } = req.query;

  if (!access_token) {
    res.status(401).send('Access token not found');
    return;
  }

  const options = {
    url: 'https://api.spotify.com/v1/me/player/currently-playing',
    headers: { 'Authorization': 'Bearer ' + access_token },
  };

  try {
    const response = await axios(options);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(error.response?.status || 500).send(error.response?.data || 'Error retrieving currently playing song');
  }
}
