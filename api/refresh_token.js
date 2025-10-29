require('dotenv').config();
import request from 'request';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export default (req, res) => {
    const { refresh_token } = req.query;
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            grant_type: 'refresh_token',
            refresh_token
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' +
                Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
        },
        json: true
    };
    request.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            res.json({
                access_token: body.access_token,
                refresh_token: body.refresh_token
            });
        } else {
            res.status(400).json({ error: 'could_not_refresh' });
        }
    });
};
