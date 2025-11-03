// src/createForm.js
import { google } from "googleapis";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
const jsonUrl = process.env.QUIZ_JSON_URL;
const maxQuestions = parseInt(process.env.MAX_QUESTIONS || "5", 10);

(async () => {
    console.log("🚀 Starting Quiz Crafter...");
    console.log(`🔍 Using credentials: ${credentialsPath}`);
    console.log(`📁 Target folder: ${folderId}`);
    console.log(`🌐 JSON source: ${jsonUrl}`);

    try {
        // --- Step 1: Check credentials file ---
        if (!fs.existsSync(credentialsPath)) {
            throw new Error(`❌ Credentials file not found: ${credentialsPath}`);
        }

        // --- Step 2: Authenticate with Google ---
        const auth = new google.auth.GoogleAuth({
            keyFile: credentialsPath,
            scopes: [
                "https://www.googleapis.com/auth/forms.body",
                "https://www.googleapis.com/auth/forms.responses.readonly",
                "https://www.googleapis.com/auth/drive.file",
            ],
        });

        const authClient = await auth.getClient();
        const forms = google.forms({ version: "v1", auth: authClient });

        console.log("✅ Authenticated successfully.");

        // --- Step 3: Create Form Request ---
        const requestBody = {
            info: {
                title: "Quiz Crafter Test Form",
                documentTitle: "Quiz Crafter Test Form",
                description: "Form generated automatically using Google Forms API",
            },
        };

        console.log("🛠️ Creating a new Google Form...");
        console.log("📤 Sending request to Google Forms API...");
        console.dir(requestBody, { depth: null });

        // --- Step 4: Send the create form request ---
        const res = await forms.forms.create({ requestBody });

        console.log("✅ Form created successfully!");
        console.log("📩 API Response:", res.data);

        console.log(`📝 Form ID: ${res.data.formId}`);
        console.log(`🔗 Form URL: ${res.data.responderUri}`);
    } catch (err) {
        console.error("❌ Error creating form:");

        // Print detailed API error info if available
        if (err.response?.data?.error) {
            console.error("🔎 API Error Details:");
            console.dir(err.response.data.error, { depth: null });
        } else if (err.errors) {
            console.dir(err.errors, { depth: null });
        } else {
            console.error(err);
        }
    }
})();
