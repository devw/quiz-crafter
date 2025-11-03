import { google } from "googleapis";
import dotenv from "dotenv";
import fs from "fs";
import authenticate from "./authUser.js";

dotenv.config();

(async () => {
    try {
        console.log("🚀 Starting Quiz Crafter with OAuth2 user authentication...");

        // 1️⃣ Authenticate user
        const authClient = await authenticate();
        const forms = google.forms({ version: "v1", auth: authClient });

        console.log("✅ Authenticated successfully with user credentials.");

        // 2️⃣ Create form (only title allowed)
        console.log("🛠️ Creating new Google Form...");
        const createResponse = await forms.forms.create({
            requestBody: {
                info: {
                    title: "Quiz Crafter Test Form",
                },
            },
        });

        const formId = createResponse.data.formId;
        console.log(`✅ Form created successfully! ID: ${formId}`);

        // 3️⃣ Add description & title update via batchUpdate
        console.log("🧩 Updating form info (description, documentTitle)...");

        const updateResponse = await forms.forms.batchUpdate({
            formId,
            requestBody: {
                requests: [
                    {
                        updateFormInfo: {
                            info: {
                                description: "🧠 Form generated automatically using Google Forms API (OAuth2 flow)",
                                documentTitle: "Quiz Crafter Test Form",
                            },
                            updateMask: "description,documentTitle",
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
        if (err.errors) {
            console.dir(err.errors, { depth: null });
        } else {
            console.dir(err, { depth: null });
        }
    }
})();
