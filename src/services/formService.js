/**
 * Google Forms service operations
 */
import { log, logSuccess } from "../utils/logger.js";
import { createQuizFormRequest, createBatchUpdateParams } from "../utils/formHelpers.js";
import { parseQuizToBatchUpdate } from "../utils/quizParser.js";

export const createFormFromQuiz = async (forms, quiz) => {
    log("🛠️", "Creating new Google Form from quiz...");

    const request = createQuizFormRequest(quiz);
    const response = await forms.forms.create(request);

    const formId = response.data.formId;
    const responderUri = response.data.responderUri;

    logSuccess(`Form created! ID: ${formId}`);

    return { forms, formId, responderUri, quiz };
};

export const addQuizQuestions = async ({ forms, formId, responderUri, quiz, drive, config }) => {
    log("🧩", "Enabling quiz mode and adding questions...");

    // Enable quiz mode
    const enableQuizBody = {
        requests: [{
            updateSettings: {
                settings: {
                    quizSettings: { isQuiz: true },
                },
                updateMask: "quizSettings.isQuiz",
            },
        }],
    };

    const enableQuizParams = createBatchUpdateParams(formId, enableQuizBody);
    await forms.forms.batchUpdate(enableQuizParams);

    log("✅", "Quiz mode enabled, adding questions...");

    // Add questions - start from index 4 if personal info was added (4 fields)
    const startIndex = config.includePersonalInfo ? 5 : 0;  // ← CAMBIATO da 4 a 5
    const requestBody = parseQuizToBatchUpdate(quiz, startIndex);
    const updateParams = createBatchUpdateParams(formId, requestBody);
    await forms.forms.batchUpdate(updateParams);

    return { formId, responderUri, quiz, drive, config };
};

export const addPersonalInfoSection = async (forms, formId) => {
    log("📝", "Adding personal info fields...");

    const requests = [
        // Section header (text only, no input field)
        {
            createItem: {
                item: {
                    title: "Personal Information",
                    description: "Please fill in your details below",
                    textItem: {},  // ← TEXT ITEM invece di questionItem
                },
                location: { index: 0 },
            },
        },
        // Actual input fields
        {
            createItem: {
                item: {
                    title: "First Name",
                    questionItem: {
                        question: {
                            required: true,
                            textQuestion: {},
                        },
                    },
                },
                location: { index: 1 },
            },
        },
        {
            createItem: {
                item: {
                    title: "Last Name",
                    questionItem: {
                        question: {
                            required: true,
                            textQuestion: {},
                        },
                    },
                },
                location: { index: 2 },
            },
        },
        {
            createItem: {
                item: {
                    title: "Section/Class (optional)",
                    questionItem: {
                        question: {
                            required: false,
                            textQuestion: {},
                        },
                    },
                },
                location: { index: 3 },
            },
        },
        // Page break
        {
            createItem: {
                item: {
                    title: "",
                    pageBreakItem: {},
                },
                location: { index: 4 },
            },
        },
    ];

    const params = createBatchUpdateParams(formId, { requests });
    await forms.forms.batchUpdate(params);

    logSuccess("Personal info fields added correctly at the beginning of the form.");
};

