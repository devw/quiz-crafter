import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import open from "open";
import http from "http";
import url from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to store the token
const TOKEN_PATH = path.join(__dirname, "../token.json");

/**
 * Load OAuth2 credentials from the path specified in .env
 */
function loadCredentials() {
    const credPath = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    if (!credPath || !fs.existsSync(credPath)) {
        throw new Error(
            `❌ OAuth2 credentials not found at: ${credPath}\n` +
                `Make sure GOOGLE_OAUTH_CLIENT_SECRET is set correctly in .env`
        );
    }
    const content = fs.readFileSync(credPath, "utf8");
    return JSON.parse(content);
}

/**
 * Create OAuth2 client
 */
function createOAuth2Client() {
    const credentials = loadCredentials();
    const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

    return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0] || "http://localhost:3000/oauth2callback");
}

/**
 * Get saved token or return null
 */
function getSavedToken() {
    if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
        return token;
    }
    return null;
}

/**
 * Save token to file
 */
function saveToken(token) {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
    console.log("💾 Token saved to:", TOKEN_PATH);
}

/**
 * Get new token via OAuth2 flow
 */
async function getNewToken(oauth2Client) {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/forms.body", "https://www.googleapis.com/auth/drive.file"],
    });

    console.log("🌐 Opening browser for authorization...");
    console.log("If browser doesn't open, visit this URL manually:");
    console.log(authUrl);

    // Open browser
    await open(authUrl);

    // Create local server to receive callback
    return new Promise((resolve, reject) => {
        const server = http.createServer(async (req, res) => {
            try {
                const queryParams = url.parse(req.url, true).query;

                if (queryParams.code) {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(`
                        <html>
                            <body style="font-family: Arial; text-align: center; padding: 50px;">
                                <h1>✅ Authentication Successful!</h1>
                                <p>You can close this window and return to the terminal.</p>
                            </body>
                        </html>
                    `);

                    server.close();

                    // Exchange code for token
                    const { tokens } = await oauth2Client.getToken(queryParams.code);
                    oauth2Client.setCredentials(tokens);
                    saveToken(tokens);

                    resolve(oauth2Client);
                } else if (queryParams.error) {
                    res.writeHead(400, { "Content-Type": "text/html" });
                    res.end(`
                        <html>
                            <body style="font-family: Arial; text-align: center; padding: 50px;">
                                <h1>❌ Authentication Failed</h1>
                                <p>Error: ${queryParams.error}</p>
                            </body>
                        </html>
                    `);
                    server.close();
                    reject(new Error(`OAuth2 error: ${queryParams.error}`));
                }
            } catch (err) {
                reject(err);
            }
        });

        server.listen(8080, () => {
            console.log("⏳ Waiting for authorization on http://localhost:8080...");
        });
    });
}

/**
 * Main authentication function
 */
export default async function authenticate() {
    const oauth2Client = createOAuth2Client();

    // Try to use saved token
    const savedToken = getSavedToken();
    if (savedToken) {
        console.log("🔑 Using saved token from:", TOKEN_PATH);
        oauth2Client.setCredentials(savedToken);

        // Check if token is still valid
        try {
            await oauth2Client.getAccessToken();
            return oauth2Client;
        } catch (err) {
            console.log("⚠️  Saved token expired or invalid, getting new one...");
            fs.unlinkSync(TOKEN_PATH);
        }
    }

    // Get new token
    console.log("🔐 Starting OAuth2 flow...");
    return await getNewToken(oauth2Client);
}
