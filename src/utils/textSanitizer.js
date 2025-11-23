/**
 * Text sanitization utilities for Google Forms API
 * Google Forms doesn't allow newlines in displayed text
 */

export const sanitizeText = (text) => {
    if (!text) return text;
    if (typeof text !== 'string') return String(text);
    
    return text
        .replace(/\n+/g, ' → ')   // Replace newlines with arrow
        .replace(/\r/g, '')        // Remove carriage returns
        .replace(/\t/g, '  ')      // Replace tabs with spaces
        .replace(/\s{2,}/g, ' ')   // Collapse multiple spaces
        .trim();
};

export const sanitizeCodeText = (text) => {
    if (!text) return text;
    if (typeof text !== 'string') return String(text);
    
    return text
        .replace(/\n/g, ' • ')     // Use bullet for line breaks
        .replace(/\r/g, '')
        .replace(/\t/g, '  ')
        .trim();
};

export const sanitizeMultiline = (text, separator = ' → ') => {
    if (!text) return text;
    if (typeof text !== 'string') return String(text);
    
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join(separator);
};
