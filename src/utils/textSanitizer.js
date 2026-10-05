/**
 * Text sanitization utilities for Google Forms API
 * Google Forms doesn't allow newlines in titles and option values,
 * but it does allow them in item descriptions (helpText).
 */

// For titles and option values: no newlines allowed
export const sanitizeText = (text) => {
    if (!text) return text;
    if (typeof text !== "string") return String(text);

    return text
        .replace(/\n+/g, " → ") // Replace newlines with arrow
        .replace(/\r/g, "") // Remove carriage returns
        .replace(/\t/g, "  ") // Replace tabs with spaces
        .replace(/\s{2,}/g, " ") // Collapse multiple spaces
        .trim();
};

export const sanitizeCodeText = (text) => {
    if (!text) return text;
    if (typeof text !== "string") return String(text);

    return text
        .replace(/\n/g, " • ") // Use bullet for line breaks
        .replace(/\r/g, "")
        .replace(/\t/g, "  ")
        .trim();
};

export const sanitizeMultiline = (text, separator = " → ") => {
    if (!text) return text;
    if (typeof text !== "string") return String(text);

    return text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join(separator);
};

// For item descriptions (hint): keeps newlines and code indentation
export const sanitizeDescription = (text) => {
    if (!text) return text;
    if (typeof text !== "string") return String(text);

    return text
        .replace(/\r\n?/g, "\n") // Normalize line endings
        .replace(/\t/g, "    ") // Tabs become 4 spaces
        .replace(/[ ]+$/gm, "") // Remove trailing spaces on each line
        .replace(/\n{3,}/g, "\n\n") // At most one empty line in a row
        .trim();
};
