// 📦 Load environment variables
import "dotenv/config";
import { google } from "googleapis";
import fs from "fs";
import os from "os";
import path from "path";

// 🏠 Expand "~" to home directory if needed
const expandHome = (p) => (p.startsWith("~") ? path.join(os.homedir(), p.slice(1)) : p);

// ✅ Load credentials from .env
const keyPath = expandHome(process.env.GOOGLE_APPLICATION_CREDENTIALS);
if (!keyPath || !fs.existsSync(keyPath)) {
    console.error("❌ Service account key not found. Check GOOGLE_APPLICATION_CREDENTIALS in .env");
    console.error("🔍 Tried path:", keyPath);
    process.exit(1);
}

// 🔑 Authenticate using service account
const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/forms.body"],
});

const testGoogleAuth = async () => {
    try {
        const client = await auth.getClient();
        const drive = google.drive({ version: "v3", auth: client });
        const res = await drive.files.list({ pageSize: 3 });
        console.log("✅ Google Drive connection successful!");
        console.log("📂 Example files:");
        res.data.files?.forEach((f) => console.log(` - ${f.name} (${f.id})`));
    } catch (err) {
        console.error("❌ Error accessing Google Drive:", err.message);
    }
};

testGoogleAuth();
