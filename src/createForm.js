import { google } from "googleapis";
import dotenv from "dotenv";
import authenticate from "./authUser.js";
import { log, logError, logSuccess, logInfo } from "./utils/logger.js";
import { createBatchUpdateParams, createQuizFormRequest } from "./utils/formHelpers.js";
import { getFormUrls } from "./utils/urlBuilder.js";
import { loadQuizFile } from "./utils/quizLoader.js";
import { parseQuizToBatchUpdate, getQuizStats } from "./utils/quizParser.js";

dotenv.config();

// 🎯 Core functions
const initializeFormsAPI = (authClient) => {
    const formsAPI = google.forms({ version: "v1", auth: authClient });
    return formsAPI;
};

const initializeDriveAPI = (authClient) => {
    const driveAPI = google.drive({ version: "v3", auth: authClient });
    return driveAPI;
};

const parseCliArgs = () => {
    const args = process.argv.slice(2);

    // Parse --quiz or -q flag
    const quizFlagIndex = args.findIndex((arg) => arg === "--quiz" || arg === "-q");
    const hasQuizFlag = quizFlagIndex !== -1;
    const quizPath = hasQuizFlag ? args[quizFlagIndex + 1] : null;

    // Parse --folder or -f flag for Google Drive folder ID
    const folderFlagIndex = args.findIndex((arg) => arg === "--folder" || arg === "-f");
    const hasFolderFlag = folderFlagIndex !== -1;
    const folderId = hasFolderFlag ? args[folderFlagIndex + 1] : process.env.GOOGLE_DRIVE_FOLDER_ID;

    const config = {
        quizPath,
        folderId,
        useQuiz: hasQuizFlag && quizPath,
    };

    return config;
};

const displayQuizStats = (quiz) => {
    const stats = getQuizStats(quiz);

    logInfo(`Quiz loaded: "${quiz.title}"`);
    logInfo(`Sections: ${stats.sections} | Total questions: ${stats.totalQuestions}`);
};

const displayResults = (formId, responderUri, quiz, folderId) => {
    const urls = getFormUrls(formId, responderUri);

    logSuccess("Form created successfully!");
    logInfo(`Title: "${quiz.title}"`);
    log("🔗", `Edit URL: ${urls.edit}`);
    log("📩", `Response URL: ${urls.response}`);

    if (folderId) {
        log("📁", `Saved to folder ID: ${folderId}`);
    }
};

// 🚀 Main workflow
const createFormFromQuiz = (forms, quiz) => {
    log("🛠️", "Creating new Google Form from quiz...");

    const request = createQuizFormRequest(quiz);
    const createPromise = forms.forms.create(request);

    const resultPromise = createPromise.then((response) => {
        const formId = response.data.formId;
        const responderUri = response.data.responderUri;

        logSuccess(`Form created! ID: ${formId}`);

        const context = {
            forms,
            formId,
            responderUri,
            quiz,
        };

        return context;
    });

    return resultPromise;
};

const moveFormToFolder = (drive, formId, folderId) => {
    if (!folderId) {
        log("ℹ️", "No folder specified, form will remain in root");
        return Promise.resolve();
    }

    log("📁", `Moving form to folder: ${folderId}...`);

    // Get current parents
    const getFilePromise = drive.files.get({
        fileId: formId,
        fields: "parents",
    });

    const movePromise = getFilePromise.then((file) => {
        const previousParents = file.data.parents ? file.data.parents.join(",") : "";

        log("🔄", `Removing from: ${previousParents || "root"}`);

        return drive.files.update({
            fileId: formId,
            addParents: folderId,
            removeParents: previousParents,
            fields: "id, parents",
        });
    });

    const resultPromise = movePromise.then((result) => {
        logSuccess(`Form moved to folder successfully!`);
        return result;
    });

    const errorHandledPromise = resultPromise.catch((error) => {
        logError("Failed to move form to folder:", error);
        log("ℹ️", "Form created but remains in root folder");
    });

    return errorHandledPromise;
};

const addQuizQuestions = ({ forms, formId, responderUri, quiz, drive, config }) => {
    log("🧩", "Enabling quiz mode and adding questions...");

    // First, enable quiz mode on the form
    const enableQuizBody = {
        requests: [
            {
                updateSettings: {
                    settings: {
                        quizSettings: {
                            isQuiz: true,
                        },
                    },
                    updateMask: "quizSettings.isQuiz",
                },
            },
        ],
    };

    const enableQuizParams = createBatchUpdateParams(formId, enableQuizBody);
    const enableQuizPromise = forms.forms.batchUpdate(enableQuizParams);

    // Then, add all questions
    const addQuestionsPromise = enableQuizPromise.then(() => {
        log("✅", "Quiz mode enabled, adding questions...");

        const requestBody = parseQuizToBatchUpdate(quiz);
        const updateParams = createBatchUpdateParams(formId, requestBody);

        return forms.forms.batchUpdate(updateParams);
    });

    const resultPromise = addQuestionsPromise.then(() => {
        const result = {
            formId,
            responderUri,
            quiz,
            drive,
            config,
        };
        return result;
    });

    return resultPromise;
};

const startQuizCrafter = () => {
    log("🚀", "Starting Quiz Crafter with OAuth2 user authentication...");

    const config = parseCliArgs();

    if (!config.useQuiz) {
        const errorMsg = `
Usage: node src/createForm.js --quiz <path-to-quiz.json> [--folder <folder-id>]

Arguments:
  --quiz, -q    Path to quiz JSON file (required)
  --folder, -f  Google Drive folder ID (optional, uses GOOGLE_DRIVE_FOLDER_ID from .env if not specified)

Examples:
  node src/createForm.js --quiz ./src/config/examples/sample-quiz.json
  node src/createForm.js -q ./my-quiz.json -f 1R2gG0ztLSSTEjDdTrjFFlTi_FThPUtaM
  node src/createForm.js --quiz ./quiz.json --folder 1ABC123xyz
        `;
        console.error(errorMsg);
        process.exit(1);
    }

    const quizPromise = loadQuizFile(config.quizPath);

    const validatePromise = quizPromise.then((quiz) => {
        displayQuizStats(quiz);
        return { quiz, config };
    });

    const authPromise = validatePromise.then(({ quiz, config }) => {
        return authenticate().then((authClient) => ({ authClient, quiz, config }));
    });

    const formsPromise = authPromise.then(({ authClient, quiz, config }) => {
        logSuccess("Authenticated successfully with user credentials.");
        const formsAPI = initializeFormsAPI(authClient);
        const driveAPI = initializeDriveAPI(authClient);
        return { forms: formsAPI, drive: driveAPI, quiz, config };
    });

    const createPromise = formsPromise.then(({ forms, drive, quiz, config }) => {
        return createFormFromQuiz(forms, quiz).then((context) => ({
            ...context,
            drive,
            config,
        }));
    });

    const updatePromise = createPromise.then((context) => {
        return addQuizQuestions(context);
    });

    const movePromise = updatePromise.then((context) => {
        return moveFormToFolder(context.drive, context.formId, context.config.folderId).then(() => context);
    });

    const finalPromise = movePromise.then(({ formId, responderUri, quiz, config }) => {
        displayResults(formId, responderUri, quiz, config.folderId);
    });

    const errorHandledPromise = finalPromise.catch((error) => {
        logError("Error creating form:", error);
        process.exit(1);
    });

    return errorHandledPromise;
};

// 🎬 Execute
startQuizCrafter();
