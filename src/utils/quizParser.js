/**
 * Quiz Parser - Converts quiz JSON to Google Forms batch update format
 */
import { sanitizeText } from "./textSanitizer.js";

export const getQuizStats = (quiz) => {
    const sections = quiz.sections?.length || 0;
    const totalQuestions =
        quiz.sections?.reduce((sum, section) => {
            return sum + (section.questions?.length || 0);
        }, 0) || 0;

    return { sections, totalQuestions };
};

const createTextItem = (text) => {
    return {
        title: sanitizeText(text),
        textItem: {},
    };
};

const createQuestionItem = (questionData, questionIndex) => {
    const question = {
        title: sanitizeText(questionData.question),
        questionItem: {
            question: {
                required: questionData.required !== false,
            },
        },
    };

    if (questionData.hint) {
        question.description = sanitizeText(questionData.hint);
    }

    if (questionData.options && questionData.options.length > 0) {
        question.questionItem.question.choiceQuestion = {
            type: "RADIO",
            options: questionData.options.map((opt) => ({
                value: sanitizeText(opt.value),
            })),
            shuffle: false,
        };

        const correctOption = questionData.options.find((opt) => opt.isCorrect);
        if (correctOption) {
            question.questionItem.question.grading = {
                pointValue: 1,
                correctAnswers: {
                    answers: [{ value: sanitizeText(correctOption.value) }],
                },
                whenRight: {
                    text: sanitizeText(questionData.feedback || "Correct!"),
                },
                whenWrong: {
                    text: sanitizeText(questionData.feedback || "Incorrect. Try again!"),
                },
            };
        }
    } else {
        question.questionItem.question.textQuestion = {
            paragraph: false,
        };
    }

    return question;
};

const createPageBreak = () => {
    return { pageBreakItem: {} };
};

export const parseQuizToBatchUpdate = (quiz) => {
    const requests = [];
    let questionIndex = 0;
    let itemIndex = 0; // FIX: contatore reale degli item

    if (quiz.title) {
        requests.push({
            updateFormInfo: {
                info: {
                    title: sanitizeText(quiz.title),
                    description: quiz.description ? sanitizeText(quiz.description) : undefined,
                },
                updateMask: quiz.description ? "title,description" : "title",
            },
        });
    }

    if (quiz.sections && Array.isArray(quiz.sections)) {
        quiz.sections.forEach((section, sectionIndex) => {
            // Header
            if (section.title) {
                let headerText = section.title;
                if (section.description) headerText += ` - ${section.description}`;

                requests.push({
                    createItem: {
                        item: createTextItem(headerText),
                        location: { index: itemIndex++ }, // <-- FIX
                    },
                });
            }

            // Questions
            section.questions.forEach((question) => {
                requests.push({
                    createItem: {
                        item: createQuestionItem(question, questionIndex),
                        location: { index: itemIndex++ }, // <-- FIX
                    },
                });
                questionIndex++;
            });

            // Page break
            if (sectionIndex < quiz.sections.length - 1) {
                requests.push({
                    createItem: {
                        item: createPageBreak(),
                        location: { index: itemIndex++ }, // <-- FIX
                    },
                });
            }
        });
    }

    return { requests };
};

export const validateQuiz = (quiz) => {
    const errors = [];

    if (!quiz.title) {
        errors.push("Quiz must have a title");
    }

    if (!quiz.sections || !Array.isArray(quiz.sections) || quiz.sections.length === 0) {
        errors.push("Quiz must have at least one section");
    }

    quiz.sections?.forEach((section, sectionIndex) => {
        if (!section.questions || !Array.isArray(section.questions) || section.questions.length === 0) {
            errors.push(`Section ${sectionIndex + 1} must have at least one question`);
        }

        section.questions?.forEach((question, questionIndex) => {
            if (!question.question) {
                errors.push(`Question ${questionIndex + 1} in section ${sectionIndex + 1} must have question text`);
            }

            if (question.type === "MULTIPLE_CHOICE" && (!question.options || question.options.length === 0)) {
                errors.push(`Question ${questionIndex + 1} in section ${sectionIndex + 1} must have options`);
            }

            if (question.question?.includes("\n")) {
                console.warn(
                    `⚠️  Question ${questionIndex + 1} in section ${sectionIndex + 1} contains newlines - will be sanitized`
                );
            }
        });
    });

    return {
        valid: errors.length === 0,
        errors,
    };
};
