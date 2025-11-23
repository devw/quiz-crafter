/**
 * Google Drive service operations
 */
import { log, logSuccess, logError } from "../utils/logger.js";

export const moveFormToFolder = async (drive, formId, folderId) => {
    if (!folderId) {
        log("ℹ️", "No folder specified, form will remain in root");
        return;
    }

    log("📁", `Moving form to folder: ${folderId}...`);

    try {
        const file = await drive.files.get({
            fileId: formId,
            fields: "parents",
        });

        const previousParents = file.data.parents ? file.data.parents.join(",") : "";
        log("🔄", `Removing from: ${previousParents || "root"}`);

        await drive.files.update({
            fileId: formId,
            addParents: folderId,
            removeParents: previousParents,
            fields: "id, parents",
        });

        logSuccess("Form moved to folder successfully!");
    } catch (error) {
        logError("Failed to move form to folder:", error);
        log("ℹ️", "Form created but remains in root folder");
    }
};
