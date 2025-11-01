require('dotenv').config();
import querystring from 'querystring';
import request from 'request';
import cookie from 'cookie';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const STATE_KEY = 'spotify_auth_state';

export default (req, res) => {
    const { code, state } = req.query;
    const cookies = cookie.parse(req.headers.cookie || '');
    const storedState = cookies[STATE_KEY];

    // Validate state to protect against CSRF
    if (!state || state !== storedState) {
        console.error('State mismatch:', { received: state, expected: storedState });
        return res
            .status(400)
            .json({ error: 'state_mismatch' });
    }

    // Clear the state cookie
    res.setHeader('Set-Cookie', `${STATE_KEY}=; Max-Age=0; Path=/; Secure`);

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization:
                'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
        },
        json: true,
    };

    request.post(authOptions, (error, response, body) => {
        if (error || response.statusCode !== 200) {
            console.error('Failed to retrieve tokens:', error || body);
            return res.status(400).json({ error: 'invalid_token' });
        }

        const { access_token, refresh_token, expires_in } = body;
        console.log(`🚀 ~ { access_token, refresh_token, expires_in }:`, { access_token, refresh_token, expires_in })

        // build your front‑end URL with tokens in query or hash
        //const reactAppUrl = 'https://localhost:4200/';
        const reactAppUrl = 'https://portal.panelspcontrol.online/';
        const params = new URLSearchParams({
            access_token,
            refresh_token,
            expires_in: expires_in.toString(),
        });

        // Redirect the browser to your React app
        res.writeHead(302, {
            Location: `${reactAppUrl}?${params.toString()}`,
            // You may want to clear the cookie here too
        });

        return res.end();
    });
};
