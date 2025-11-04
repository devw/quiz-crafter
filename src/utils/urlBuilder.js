/**
 * 🔗 URL building utilities for Google Forms
 */

const GOOGLE_FORMS_BASE_URL = "https://docs.google.com/forms/d";

/**
 * Build edit URL for a Google Form
 * @param {string} formId - The form ID
 * @returns {string} Edit URL
 */
export const buildEditUrl = (formId) => {
    const editUrl = `${GOOGLE_FORMS_BASE_URL}/${formId}/edit`;
    return editUrl;
};

/**
 * Build response URL (or return placeholder if not available)
 * @param {string|null} responderUri - The responder URI from API
 * @returns {string} Response URL or placeholder
 */
export const buildResponseUrl = (responderUri) => {
    const responseUrl = responderUri || "(not available yet)";
    return responseUrl;
};

/**
 * Get all URLs for a form
 * @param {string} formId - The form ID
 * @param {string|null} responderUri - The responder URI from API
 * @returns {Object} Object containing edit and response URLs
 */
export const getFormUrls = (formId, responderUri) => {
    const editUrl = buildEditUrl(formId);
    const responseUrl = buildResponseUrl(responderUri);

    const urls = {
        edit: editUrl,
        response: responseUrl,
    };

    return urls;
};
