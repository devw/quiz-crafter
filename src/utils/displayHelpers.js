/**
 * Display and formatting utilities
 */
import { log, logInfo, logSuccess } from "./logger.js";
import { getFormUrls } from "./urlBuilder.js";
import { getQuizStats } from "./quizParser.js";

export const displayQuizStats = (quiz) => {
    const stats = getQuizStats(quiz);
    logInfo(`Quiz loaded: "${quiz.title}"`);
    logInfo(`Sections: ${stats.sections} | Total questions: ${stats.totalQuestions}`);
};

export const displayResults = (formId, responderUri, quiz, folderId) => {
    const urls = getFormUrls(formId, responderUri);

    logSuccess("Form created successfully!");
    logInfo(`Title: "${quiz.title}"`);
    log("🔗", `Edit URL: ${urls.edit}`);
    log("📩", `Response URL: ${urls.response}`);

    if (folderId) {
        const folderUrl = `https://drive.google.com/drive/folders/${folderId}`;
        log("📂", `Drive Folder: ${folderUrl}`);
    }
};
