/**
 * 📂 Quiz JSON file loader and validator
 */

import fs from "fs/promises";
import { existsSync } from "fs";

// 🔧 Pure utility functions
const fileExists = (path) => existsSync(path);

const readFileContent = (path) => fs.readFile(path, "utf8");

const parseJSON = (content) => {
    const parsed = JSON.parse(content);
    return parsed;
};

// 📋 Validation functions (pure)
const hasRequiredField = (obj, field) => obj.hasOwnProperty(field) && obj[field] !== null && obj[field] !== undefined;

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const isNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;

const validateQuizTitle = (quiz) => {
    const hasTitle = hasRequiredField(quiz, "title");
    const isValid = hasTitle && isNonEmptyString(quiz.title);

    const result = {
        valid: isValid,
        field: "title",
        message: isValid ? null : "Quiz must have a non-empty title",
    };

    return result;
};

const validateQuizSections = (quiz) => {
    const hasSections = hasRequiredField(quiz, "sections");
    const isValid = hasSections && isNonEmptyArray(quiz.sections);

    const result = {
        valid: isValid,
        field: "sections",
        message: isValid ? null : "Quiz must have at least one section",
    };

    return result;
};

const validateSection = (section, index) => {
    const hasTitle = hasRequiredField(section, "title") && isNonEmptyString(section.title);
    const hasQuestions = hasRequiredField(section, "questions") && isNonEmptyArray(section.questions);

    const isValid = hasTitle && hasQuestions;

    const result = {
        valid: isValid,
        field: `sections[${index}]`,
        message: isValid ? null : `Section ${index} must have title and at least one question`,
    };

    return result;
};

const validateQuestion = (question, sectionIndex, questionIndex) => {
    const requiredFields = ["title", "question", "type", "options"];
    const missingFields = requiredFields.filter((field) => !hasRequiredField(question, field));

    const hasAllFields = missingFields.length === 0;
    const hasOptions = hasAllFields && isNonEmptyArray(question.options);
    const hasMinOptions = hasOptions && question.options.length >= 2;

    const isValid = hasAllFields && hasMinOptions;

    const result = {
        valid: isValid,
        field: `sections[${sectionIndex}].questions[${questionIndex}]`,
        message: isValid
            ? null
            : `Question ${questionIndex} in section ${sectionIndex} is invalid: ${
                  missingFields.length > 0
                      ? `missing fields: ${missingFields.join(", ")}`
                      : "must have at least 2 options"
              }`,
    };

    return result;
};

const validateOption = (option, sectionIndex, questionIndex, optionIndex) => {
    const hasValue = hasRequiredField(option, "value") && isNonEmptyString(option.value);
    const hasLabel = hasRequiredField(option, "label") && isNonEmptyString(option.label);

    const isValid = hasValue && hasLabel;

    const result = {
        valid: isValid,
        field: `sections[${sectionIndex}].questions[${questionIndex}].options[${optionIndex}]`,
        message: isValid ? null : `Option ${optionIndex} is missing value or label`,
    };

    return result;
};

// 🎯 Composite validation functions
const validateAllSections = (sections) => {
    const validations = sections.map((section, index) => validateSection(section, index));
    const allValid = validations.every((v) => v.valid);
    const errors = validations.filter((v) => !v.valid);

    const result = {
        valid: allValid,
        errors,
    };

    return result;
};

const validateAllQuestions = (sections) => {
    const validations = sections.flatMap((section, sectionIndex) =>
        section.questions.map((question, questionIndex) => validateQuestion(question, sectionIndex, questionIndex))
    );

    const allValid = validations.every((v) => v.valid);
    const errors = validations.filter((v) => !v.valid);

    const result = {
        valid: allValid,
        errors,
    };

    return result;
};

const validateAllOptions = (sections) => {
    const validations = sections.flatMap((section, sectionIndex) =>
        section.questions.flatMap((question, questionIndex) =>
            question.options.map((option, optionIndex) =>
                validateOption(option, sectionIndex, questionIndex, optionIndex)
            )
        )
    );

    const allValid = validations.every((v) => v.valid);
    const errors = validations.filter((v) => !v.valid);

    const result = {
        valid: allValid,
        errors,
    };

    return result;
};

const validateQuizStructure = (quiz) => {
    const titleValidation = validateQuizTitle(quiz);
    const sectionsValidation = validateQuizSections(quiz);

    if (!titleValidation.valid || !sectionsValidation.valid) {
        const errors = [titleValidation, sectionsValidation].filter((v) => !v.valid);

        const result = {
            valid: false,
            errors,
        };

        return result;
    }

    const sectionsCheck = validateAllSections(quiz.sections);
    const questionsCheck = validateAllQuestions(quiz.sections);
    const optionsCheck = validateAllOptions(quiz.sections);

    const allErrors = [...sectionsCheck.errors, ...questionsCheck.errors, ...optionsCheck.errors];

    const allValid = allErrors.length === 0;

    const result = {
        valid: allValid,
        errors: allValid ? [] : allErrors,
    };

    return result;
};

// 🚀 Main loader function (with side effects)
export const loadQuizFile = (filePath) => {
    const checkExists = Promise.resolve(fileExists(filePath));

    const loadPromise = checkExists.then((exists) => {
        if (!exists) {
            const error = new Error(`Quiz file not found: ${filePath}`);
            throw error;
        }
        return readFileContent(filePath);
    });

    const parsePromise = loadPromise.then((content) => {
        const parsed = parseJSON(content);
        return parsed;
    });

    const validatePromise = parsePromise.then((quiz) => {
        const validation = validateQuizStructure(quiz);

        if (!validation.valid) {
            const errorMessages = validation.errors.map((e) => e.message).join("\n");
            const error = new Error(`Invalid quiz structure:\n${errorMessages}`);
            throw error;
        }

        return quiz;
    });

    return validatePromise;
};

// 🔍 Export validation utilities for testing
export const validators = {
    validateQuizTitle,
    validateQuizSections,
    validateSection,
    validateQuestion,
    validateOption,
    validateQuizStructure,
};
