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

    // Add questions
    const requestBody = parseQuizToBatchUpdate(quiz);
    const updateParams = createBatchUpdateParams(formId, requestBody);
    await forms.forms.batchUpdate(updateParams);

    return { formId, responderUri, quiz, drive, config };
};
