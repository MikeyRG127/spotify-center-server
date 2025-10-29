require('dotenv').config();
import crypto from 'crypto';
import querystring from 'querystring';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const STATE_KEY = 'spotify_auth_state';

function generateRandomString(length) {
    return crypto.randomBytes(60).toString('hex').slice(0, length);
}

export default (req, res) => {
    const state = generateRandomString(16);
    res.setHeader('Set-Cookie', `${STATE_KEY}=${state}; HttpOnly; Path=/; Secure`);
    const scope = 'user-read-private user-read-email user-follow-modify playlist-modify-public playlist-modify-private';
    const params = querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope,
        redirect_uri: REDIRECT_URI,
        state
    });
    res.writeHead(302, { Location: `https://accounts.spotify.com/authorize?${params}` });
    res.end();
};