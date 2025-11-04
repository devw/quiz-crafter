/**
 * 📋 Google Forms API helper functions
 */

/**
 * Create a request object for form creation
 * @param {string} title - The form title
 * @returns {Object} Request object for forms.create()
 */
export const createFormRequest = (title) => {
    const request = {
        requestBody: {
            info: {
                title,
                documentTitle: title,
            },
        },
    };
    return request;
};

/**
 * Create a request object for updating form description
 * @param {string} description - The form description
 * @returns {Object} Request object for forms.batchUpdate()
 */
export const updateDescriptionRequest = (description) => {
    const request = {
        requests: [
            {
                updateFormInfo: {
                    info: { description },
                    updateMask: "description",
                },
            },
        ],
    };
    return request;
};

/**
 * Create parameters for batch update
 * @param {string} formId - The form ID
 * @param {Object} requestBody - The request body
 * @returns {Object} Parameters for batchUpdate
 */
export const createBatchUpdateParams = (formId, requestBody) => {
    const params = {
        formId,
        requestBody,
    };
    return params;
};
