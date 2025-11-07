/**
 * 🔄 Quiz parser - Transform quiz JSON to Google Forms API requests
 */

import { buildAllSections } from "./questionBuilder.js";

// 🎯 Pure functions for request generation

/**
 * Create page break request
 */
const createPageBreak = (location) => {
    const request = {
        createItem: {
            item: {
                title: "",
                pageBreakItem: {},
            },
            location,
        },
    };

    return request;
};

/**
 * Create text item request (for section headers)
 */
const createTextItem = (title, description, location) => {
    const request = {
        createItem: {
            item: {
                title,
                description,
                textItem: {},
            },
            location,
        },
    };

    return request;
};

/**
 * Create question item request
 */
const createQuestionItem = (questionItemData, location) => {
    const request = {
        createItem: {
            item: questionItemData,
            location,
        },
    };

    return request;
};

/**
 * Calculate location index for items
 */
const calculateLocation = (index) => {
    const location = { index };
    return location;
};

/**
 * Generate requests for a single section
 */
const generateSectionRequests = (sectionData, startIndex) => {
    let currentIndex = startIndex;
    const requests = [];

    // Add section header
    const headerLocation = calculateLocation(currentIndex);
    const headerRequest = createTextItem(sectionData.header.title, sectionData.header.description, headerLocation);
    requests.push(headerRequest);
    currentIndex++;

    // Add all questions
    const questionRequests = sectionData.questions.map((question) => {
        const location = calculateLocation(currentIndex);
        const request = createQuestionItem(question, location);
        currentIndex++;
        return request;
    });

    requests.push(...questionRequests);

    // Add page break after section (except for last section)
    const pageBreakLocation = calculateLocation(currentIndex);
    const pageBreakRequest = createPageBreak(pageBreakLocation);
    requests.push(pageBreakRequest);
    currentIndex++;

    const result = {
        requests,
        nextIndex: currentIndex,
    };

    return result;
};

/**
 * Generate requests for all sections
 */
const generateAllSectionRequests = (sections) => {
    let startIndex = 0;

    const allRequests = sections.flatMap((section, index) => {
        const isLastSection = index === sections.length - 1;
        const result = generateSectionRequests(section, startIndex);

        startIndex = result.nextIndex;

        // Remove page break from last section
        const requests = isLastSection ? result.requests.slice(0, -1) : result.requests;

        return requests;
    });

    return allRequests;
};

/**
 * Create form info object
 */
const createFormInfo = (quiz) => {
    const title = quiz.title;
    const description = quiz.description || "";

    const info = {
        title,
        description,
    };

    return info;
};

/**
 * Create batch update request body
 */
const createBatchUpdateBody = (requests) => {
    const body = {
        requests,
    };

    return body;
};

/**
 * Parse quiz to form creation request
 */
export const parseQuizToFormCreation = (quiz) => {
    const info = createFormInfo(quiz);

    const request = {
        info,
    };

    return request;
};

/**
 * Parse quiz to batch update requests
 */
export const parseQuizToBatchUpdate = (quiz) => {
    const sections = buildAllSections(quiz);
    const requests = generateAllSectionRequests(sections);
    const body = createBatchUpdateBody(requests);

    return body;
};

/**
 * Count total questions in quiz
 */
export const countQuizQuestions = (quiz) => {
    const totalQuestions = quiz.sections.reduce((total, section) => total + section.questions.length, 0);

    return totalQuestions;
};

/**
 * Get quiz statistics
 */
export const getQuizStats = (quiz) => {
    const sectionCount = quiz.sections.length;
    const questionCount = countQuizQuestions(quiz);

    const questionsPerSection = quiz.sections.map((section) => section.questions.length);

    const stats = {
        sections: sectionCount,
        totalQuestions: questionCount,
        questionsPerSection,
    };

    return stats;
};
