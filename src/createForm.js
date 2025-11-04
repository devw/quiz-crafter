import { google } from "googleapis";
import dotenv from "dotenv";
import authenticate from "./authUser.js";
import { log, logError } from "./utils/logger.js";
import { createFormRequest, updateDescriptionRequest, createBatchUpdateParams } from "./utils/formHelpers.js";
import { getFormUrls } from "./utils/urlBuilder.js";

dotenv.config();

// 📝 Constants
const FORM_CONFIG = {
    title: "Quiz Crafter Test",
    description: "🧠 Form generated automatically using Google Forms API (OAuth2 flow)",
};

// 🎯 Core functions
const initializeFormsAPI = (authClient) => {
    const formsAPI = google.forms({ version: "v1", auth: authClient });
    return formsAPI;
};

const displayResults = (formId, responderUri) => {
    const urls = getFormUrls(formId, responderUri);

    log("✅", "Form updated successfully!");
    log("🔗", `Edit URL: ${urls.edit}`);
    log("📩", `Response URL: ${urls.response}`);
};

// 🚀 Main workflow
const createForm = (forms, title) => {
    log("🛠️", "Creating new Google Form...");

    const request = createFormRequest(title);
    const createPromise = forms.forms.create(request);

    const resultPromise = createPromise.then((response) => {
        const formId = response.data.formId;
        const responderUri = response.data.responderUri;

        log("✅", `Form created successfully! ID: ${formId}`);

        const context = {
            forms,
            formId,
            responderUri,
        };

        return context;
    });

    return resultPromise;
};

const updateFormDescription = ({ forms, formId, responderUri }, description) => {
    log("🧩", "Updating form description...");

    const requestBody = updateDescriptionRequest(description);
    const updateParams = createBatchUpdateParams(formId, requestBody);

    const updatePromise = forms.forms.batchUpdate(updateParams);

    const resultPromise = updatePromise.then(() => {
        const result = {
            formId,
            responderUri,
        };
        return result;
    });

    return resultPromise;
};

const startQuizCrafter = () => {
    log("🚀", "Starting Quiz Crafter with OAuth2 user authentication...");

    const authPromise = authenticate();

    const formsPromise = authPromise.then((authClient) => {
        log("✅", "Authenticated successfully with user credentials.");
        const formsAPI = initializeFormsAPI(authClient);
        return formsAPI;
    });

    const createPromise = formsPromise.then((forms) => {
        const formContext = createForm(forms, FORM_CONFIG.title);
        return formContext;
    });

    const updatePromise = createPromise.then((context) => {
        const updatedContext = updateFormDescription(context, FORM_CONFIG.description);
        return updatedContext;
    });

    const finalPromise = updatePromise.then(({ formId, responderUri }) => {
        displayResults(formId, responderUri);
    });

    const errorHandledPromise = finalPromise.catch((error) => {
        logError("Error creating or updating form:", error);
    });

    return errorHandledPromise;
};

// 🎬 Execute
startQuizCrafter();
