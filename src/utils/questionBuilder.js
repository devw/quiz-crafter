/**
 * 🔨 Question builder utilities for Google Forms API
 */

// 🎯 Pure functions for building question components

/**
 * Map quiz question type to Google Forms question type
 */
const mapQuestionType = (quizType) => {
    const typeMap = {
        MULTIPLE_CHOICE: "RADIO",
        CHECKBOX: "CHECKBOX",
        DROPDOWN: "DROPDOWN",
    };

    const formsType = typeMap[quizType] || "RADIO";
    return formsType;
};

/**
 * Create option object for Google Forms
 */
const createOption = (optionData) => {
    const option = {
        value: optionData.value,
    };

    return option;
};

/**
 * Create all options from quiz data
 */
const createOptions = (optionsData) => {
    const options = optionsData.map(createOption);
    return options;
};

/**
 * Find correct answer(s) from options
 */
const findCorrectAnswers = (optionsData) => {
    const correctOptions = optionsData.filter((opt) => opt.isCorrect);
    const correctAnswers = correctOptions.map((opt) => opt.value);
    return correctAnswers;
};

/**
 * Create grading configuration if correct answers exist
 */
const createGrading = (optionsData, feedback) => {
    const correctAnswers = findCorrectAnswers(optionsData);
    const hasCorrectAnswers = correctAnswers.length > 0;

    if (!hasCorrectAnswers) {
        return null;
    }

    const correctAnswersObj = {
        answers: correctAnswers.map((answer) => ({ value: answer })),
    };

    const generalFeedback = feedback ? { text: feedback } : null;

    const grading = {
        pointValue: 1,
        correctAnswers: correctAnswersObj,
        whenRight: generalFeedback,
        whenWrong: generalFeedback,
    };

    return grading;
};

/**
 * Create choice question configuration
 */
const createChoiceQuestion = (questionData) => {
    const formsType = mapQuestionType(questionData.type);
    const options = createOptions(questionData.options);

    const choiceQuestion = {
        type: formsType,
        options,
    };

    return choiceQuestion;
};

/**
 * Build complete question item for Google Forms API
 */
export const buildQuestion = (questionData) => {
    const choiceQuestion = createChoiceQuestion(questionData);
    const grading = createGrading(questionData.options, questionData.feedback);
    const isRequired = questionData.required !== false;

    // Title: question number/identifier
    const title = questionData.title;

    // Description: the actual question text + hint
    const descriptionParts = [questionData.question];
    if (questionData.hint) {
        descriptionParts.push(`\n💡 ${questionData.hint}`);
    }
    const description = descriptionParts.join("");

    const questionItem = {
        title,
        description,
        questionItem: {
            question: {
                required: isRequired,
                choiceQuestion,
                grading,
            },
        },
    };

    return questionItem;
};

/**
 * Build all questions from a section
 */
export const buildSectionQuestions = (section) => {
    const questions = section.questions.map(buildQuestion);
    return questions;
};

/**
 * Create section header item
 */
export const buildSectionHeader = (section) => {
    const title = section.title;
    const description = section.description || "";

    const header = {
        title,
        description,
    };

    return header;
};

/**
 * Build complete section with header and questions
 */
export const buildSection = (section) => {
    const header = buildSectionHeader(section);
    const questions = buildSectionQuestions(section);

    const sectionData = {
        header,
        questions,
    };

    return sectionData;
};

/**
 * Build all sections from quiz
 */
export const buildAllSections = (quiz) => {
    const sections = quiz.sections.map(buildSection);
    return sections;
};
