import { google } from "googleapis";
import dotenv from "dotenv";
import authenticate from "./authUser.js";

dotenv.config();

(async () => {
    try {
        console.log("🚀 Starting Quiz Crafter with OAuth2 user authentication...");

        // 1️⃣ Authenticate user
        const authClient = await authenticate();
        const forms = google.forms({ version: "v1", auth: authClient });

        console.log("✅ Authenticated successfully with user credentials.");

        // 2️⃣ Create form with all info at once
        console.log("🛠️ Creating new Google Form...");
        const createResponse = await forms.forms.create({
            requestBody: {
                info: {
                    title: "Quiz Crafter Test Form",
                    documentTitle: "Quiz Crafter Test Form", // Set on create
                },
            },
        });

        const formId = createResponse.data.formId;
        console.log(`✅ Form created successfully! ID: ${formId}`);

        // 3️⃣ Update only the description (documentTitle is read-only after creation)
        console.log("🧩 Updating form description...");

        const updateResponse = await forms.forms.batchUpdate({
            formId,
            requestBody: {
                requests: [
                    {
                        updateFormInfo: {
                            info: {
                                description: "🧠 Form generated automatically using Google Forms API (OAuth2 flow)",
                            },
                            updateMask: "description", // Only update description
                        },
                    },
                ],
            },
        });

        console.log("✅ Form updated successfully!");
        console.log(`🔗 Edit URL: https://docs.google.com/forms/d/${formId}/edit`);
        console.log(`📩 Response URL: ${createResponse.data.responderUri || "(not available yet)"}`);
    } catch (err) {
        console.error("❌ Error creating or updating form:");
        if (err.response?.data) {
            console.error(err.response.data);
        } else if (err.message) {
            console.error(err.message);
        } else {
            console.dir(err, { depth: null });
        }
    }
})();
