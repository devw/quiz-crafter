import dotenv from "dotenv";
import authenticate from "./authUser.js";
import { log, logError, logSuccess } from "./utils/logger.js";
import { parseCliArgs, getUsageMessage } from "./utils/cliParser.js";
import { initializeAPIs } from "./utils/apiInitializer.js";
import { displayQuizStats, displayResults } from "./utils/displayHelpers.js";
import { loadQuizFile } from "./utils/quizLoader.js";
import { createFormFromQuiz, addQuizQuestions } from "./services/formService.js";
import { moveFormToFolder } from "./services/driveService.js";

dotenv.config();

const startQuizCrafter = async () => {
    try {
        log("🚀", "Starting Quiz Crafter with OAuth2 user authentication...");

        // Parse CLI arguments
        const config = parseCliArgs();
        if (!config.useQuiz) {
            console.error(getUsageMessage());
            process.exit(1);
        }

        // Load and validate quiz
        const quiz = await loadQuizFile(config.quizPath);
        displayQuizStats(quiz);

        // Authenticate
        const authClient = await authenticate();
        logSuccess("Authenticated successfully with user credentials.");
        const { forms, drive } = initializeAPIs(authClient);

        // Create form and add questions
        const formContext = await createFormFromQuiz(forms, quiz);
        const questionContext = await addQuizQuestions({
            ...formContext,
            drive,
            config,
        });

        // Move to folder if specified
        await moveFormToFolder(drive, questionContext.formId, config.folderId);

        // Display results
        displayResults(
            questionContext.formId,
            questionContext.responderUri,
            quiz,
            config.folderId
        );

    } catch (error) {
        logError("Error creating form:", error);
        process.exit(1);
    }
};

// Execute
startQuizCrafter();
