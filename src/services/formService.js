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

    const items = [
        { title: "Personal Information", type: "text", required: false },
        { title: "First Name", type: "text", required: true },
        { title: "Last Name", type: "text", required: true },
        { title: "Section/Class (optional)", type: "text", required: false },
    ];

    const requests = items.map((item, index) => ({
        createItem: {
            item: {
                title: item.title,
                questionItem: {
                    question: {
                        required: item.required,
                        textQuestion: {},
                    },
                },
            },
            location: { index },
        },
    }));

    // Add page break after personal info section
    requests.push({
        createItem: {
            item: {
                title: "",
                pageBreakItem: {},  // ← PAGE BREAK
            },
            location: { index: items.length },  // ← Dopo l'ultimo campo personale
        },
    });

    const params = createBatchUpdateParams(formId, { requests });
    await forms.forms.batchUpdate(params);

    logSuccess("Personal info fields added correctly at the beginning of the form.");
};

