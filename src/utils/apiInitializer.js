/**
 * Google API initialization
 */
import { google } from "googleapis";

export const initializeFormsAPI = (authClient) => {
    return google.forms({ version: "v1", auth: authClient });
};

export const initializeDriveAPI = (authClient) => {
    return google.drive({ version: "v3", auth: authClient });
};

export const initializeAPIs = (authClient) => {
    return {
        forms: initializeFormsAPI(authClient),
        drive: initializeDriveAPI(authClient),
    };
};
