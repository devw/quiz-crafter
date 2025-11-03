import fs from "fs";
import path from "path";
import { google } from "googleapis";
import open from "open";
import readline from "readline";
import "dotenv/config";

const TOKEN_PATH = path.resolve(".oauth_token.json");
const CREDENTIALS_PATH = process.env.GOOGLE_OAUTH_CLIENT_SECRET.replace(/^~\//, `${process.env.HOME}/`);

async function authenticate() {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
    const { client_secret, client_id, redirect_uris } = credentials.installed;

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    if (fs.existsSync(TOKEN_PATH)) {
        oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));
        console.log("✅ Loaded existing OAuth token.");
        return oAuth2Client;
    }

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/forms.body",
            "https://www.googleapis.com/auth/forms.responses.readonly",
            "https://www.googleapis.com/auth/drive.file",
        ],
    });

    console.log("🌐 Authorize this app by visiting this URL:\n", authUrl);
    await open(authUrl);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const code = await new Promise((resolve) => rl.question("Enter the authorization code: ", resolve));
    rl.close();

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log(`🔒 Token stored at ${TOKEN_PATH}`);

    return oAuth2Client;
}

export default authenticate;
