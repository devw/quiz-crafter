import { google } from "googleapis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const credentialsPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS.replace("~", process.env.HOME));

const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ["https://www.googleapis.com/auth/forms.body"],
});

const forms = google.forms({ version: "v1", auth });

const createForm = async () => {
    try {
        const res = await forms.forms.create({
            requestBody: {
                info: {
                    title: "🧠 Quiz Crafter Test Form",
                    documentTitle: "Quiz Crafter Demo",
                },
            },
        });

        console.log("✅ Form created successfully!");
        console.log("📝 Form ID:", res.data.formId);
        console.log(
            "🔗 Edit URL (open with your account): https://docs.google.com/forms/d/" + res.data.formId + "/edit"
        );
    } catch (err) {
        console.error("❌ Error creating form:", err.message);
    }
};

createForm();
