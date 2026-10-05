/**
 * CLI argument parser
 */

export const parseCliArgs = () => {
  const args = process.argv.slice(2);

  // Parse --quiz or -q flag
  const quizFlagIndex = args.findIndex((arg) => arg === "--quiz" || arg === "-q");
  const hasQuizFlag = quizFlagIndex !== -1;
  const quizPath = hasQuizFlag ? args[quizFlagIndex + 1] : null;

  // Parse --folder or -f flag for Google Drive folder ID
  const folderFlagIndex = args.findIndex((arg) => arg === "--folder" || arg === "-f");
  const hasFolderFlag = folderFlagIndex !== -1;
  const folderId = hasFolderFlag ? args[folderFlagIndex + 1] : process.env.GOOGLE_DRIVE_FOLDER_ID;

  // Parse --include-personal-info flag
  const includePersonalInfo = args.includes("--include-personal-info");

  const config = {
      quizPath,
      folderId,
      useQuiz: hasQuizFlag && quizPath,
      includePersonalInfo, // nuova opzione
  };

  return config;
};

export const getUsageMessage = () => {
  return `
Usage: node src/createForm.js --quiz <path-to-quiz.json> [--folder <folder-id>] [--include-personal-info]

Arguments:
--quiz, -q              Path to quiz JSON file (required)
--folder, -f            Google Drive folder ID (optional, uses GOOGLE_DRIVE_FOLDER_ID from .env if not specified)
--include-personal-info Include a first section for personal info (first name, last name, section/class)

Examples:
node src/createForm.js --quiz ./src/config/examples/sample-quiz.json
node src/createForm.js -q ./my-quiz.json -f 1R2gG0ztLSSTEjDdTrjFFlTi_FThPUtaM
node src/createForm.js --quiz ./quiz.json --folder 1ABC123xyz --include-personal-info
  `;
};
