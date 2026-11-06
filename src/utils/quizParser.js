/**
 * Quiz Parser - Converts quiz JSON to Google Forms batch update format
 *
 * Supported question types:
 *   - MULTIPLE_CHOICE (default when options are present): radio buttons, 1 point, feedback
 *   - PARAGRAPH: open question, long free-text answer, no automatic grading
 *   - SHORT_ANSWER: open question, short free-text answer, no automatic grading
 */
import { sanitizeText, sanitizeDescription } from "./textSanitizer.js";

const OPEN_TYPES = ["PARAGRAPH", "SHORT_ANSWER"];

const hasOptions = (questionData) => Array.isArray(questionData.options) && questionData.options.length > 0;

const isOpenQuestion = (questionData) => OPEN_TYPES.includes(questionData.type) || !hasOptions(questionData);

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
        title: sanitizeText(questionData.title || questionData.question),
        questionItem: {
            question: {
                required: questionData.required !== false,
            },
        },
    };

    const descriptionParts = questionData.title ? [questionData.question] : [];
    if (questionData.hint) {
        descriptionParts.push(`\n\n💡 ${questionData.hint}`);
    }
    question.description = sanitizeDescription(descriptionParts.join(""));

    if (!isOpenQuestion(questionData)) {
        // Multiple choice question
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
        // Open question: PARAGRAPH = long answer, SHORT_ANSWER (or no type) = short answer.
        // No grading: the teacher corrects it by hand. The "feedback" field of the JSON
        // is not sent to Google Forms; it is only a guide for the teacher.
        question.questionItem.question.textQuestion = {
            paragraph: questionData.type === "PARAGRAPH",
        };
    }

    return question;
};

const createPageBreak = () => {
    return { pageBreakItem: {} };
};

export const parseQuizToBatchUpdate = (quiz, startIndex = 0) => {
    const requests = [];
    let questionIndex = 0;
    let itemIndex = startIndex;

    if (quiz.title) {
        requests.push({
            updateFormInfo: {
                info: {
                    title: sanitizeText(quiz.title),
                    // The form description can contain line breaks (e.g. a list of rules)
                    description: quiz.description ? sanitizeDescription(quiz.description) : undefined,
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
                        location: { index: itemIndex++ },
                    },
                });
            }

            // Questions
            (section.questions || []).forEach((question) => {
                requests.push({
                    createItem: {
                        item: createQuestionItem(question, questionIndex),
                        location: { index: itemIndex++ },
                    },
                });
                questionIndex++;
            });

            // Page break
            if (sectionIndex < quiz.sections.length - 1) {
                requests.push({
                    createItem: {
                        item: createPageBreak(),
                        location: { index: itemIndex++ },
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

            if (question.type === "MULTIPLE_CHOICE" && !hasOptions(question)) {
                errors.push(`Question ${questionIndex + 1} in section ${sectionIndex + 1} must have options`);
            }

            if (OPEN_TYPES.includes(question.type) && hasOptions(question)) {
                console.warn(
                    `⚠️  Question ${questionIndex + 1} in section ${sectionIndex + 1} is ${question.type}: its options will be ignored`,
                );
            }

            if (question.question?.includes("\n")) {
                console.warn(
                    `⚠️  Question ${questionIndex + 1} in section ${sectionIndex + 1} contains newlines - will be sanitized`,
                );
            }
        });
    });

    return {
        valid: errors.length === 0,
        errors,
    };
};
