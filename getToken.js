import { google } from "googleapis";

const keyFile = "/Users/antonio/.config/quiz-crafter-477015-cc6e9e77fbd5.json";

const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: [
        "https://www.googleapis.com/auth/forms.body",
        "https://www.googleapis.com/auth/forms.responses.readonly",
        "https://www.googleapis.com/auth/drive.file",
    ],
});

const client = await auth.getClient();
const token = await client.getAccessToken();
console.log(token.token);
