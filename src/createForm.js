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

const parseCliArgs = () => {
    const args = process.argv.slice(2);

    const quizFlagIndex = args.findIndex((arg) => arg === "--quiz" || arg === "-q");
    const hasQuizFlag = quizFlagIndex !== -1;
    const quizPath = hasQuizFlag ? args[quizFlagIndex + 1] : null;

    const config = {
        quizPath,
        useQuiz: hasQuizFlag && quizPath,
    };

    return config;
};

const displayQuizStats = (quiz) => {
    const stats = getQuizStats(quiz);

    logInfo(`Quiz loaded: "${quiz.title}"`);
    logInfo(`Sections: ${stats.sections} | Total questions: ${stats.totalQuestions}`);
};

const displayResults = (formId, responderUri, quiz) => {
    const urls = getFormUrls(formId, responderUri);

    logSuccess("Form created successfully!");
    logInfo(`Title: "${quiz.title}"`);
    log("🔗", `Edit URL: ${urls.edit}`);
    log("📩", `Response URL: ${urls.response}`);
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

const addQuizQuestions = ({ forms, formId, responderUri, quiz }) => {
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
Usage: node src/createForm.js --quiz <path-to-quiz.json>

Example:
  node src/createForm.js --quiz ./src/config/examples/sample-quiz.json
  node src/createForm.js -q ./my-quiz.json
        `;
        console.error(errorMsg);
        process.exit(1);
    }

    const quizPromise = loadQuizFile(config.quizPath);

    const validatePromise = quizPromise.then((quiz) => {
        displayQuizStats(quiz);
        return quiz;
    });

    const authPromise = validatePromise.then((quiz) => {
        return authenticate().then((authClient) => ({ authClient, quiz }));
    });

    const formsPromise = authPromise.then(({ authClient, quiz }) => {
        logSuccess("Authenticated successfully with user credentials.");
        const formsAPI = initializeFormsAPI(authClient);
        return { forms: formsAPI, quiz };
    });

    const createPromise = formsPromise.then(({ forms, quiz }) => {
        return createFormFromQuiz(forms, quiz);
    });

    const updatePromise = createPromise.then((context) => {
        return addQuizQuestions(context);
    });

    const finalPromise = updatePromise.then(({ formId, responderUri, quiz }) => {
        displayResults(formId, responderUri, quiz);
    });

    const errorHandledPromise = finalPromise.catch((error) => {
        logError("Error creating form:", error);
        process.exit(1);
    });

    return errorHandledPromise;
};

// 🎬 Execute
startQuizCrafter();
