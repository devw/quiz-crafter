# 📝 Quiz Crafter

Automate Google Forms quiz creation from JSON files via CLI.

## ✨ Features

- 📋 Create quizzes from JSON with automatic grading
- 💡 Support for hints and answer explanations
- 📁 Organize forms in Google Drive folders
- 🔐 OAuth2 authentication (one-time setup)

---

## 🚀 Quick Start

### 1. Install

```bash
git clone <repo-url>
cd quiz-crafter
yarn install
```

### 2. Setup Google Cloud

1. Create project at [Google Cloud Console](https://console.cloud.google.com/)
2. Enable [Forms API](https://console.cloud.google.com/apis/library/forms.googleapis.com) and [Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com)
3. Create OAuth2 credentials (Web application)
    - Add redirect URI: `http://localhost:8080/oauth2callback`
    - Download credentials JSON
4. Add yourself as test user in [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)

### 3. Configure

```bash
cp .env.example .env
# Edit .env with your credentials path
```

---

## 🎓 Create Your First Quiz

### Step 1: Create JSON file (`my-quiz.json`)

```json
{
    "title": "Math Quiz",
    "description": "Test your math skills",
    "sections": [
        {
            "title": "Addition",
            "description": "Solve these problems",
            "questions": [
                {
                    "title": "Question 1",
                    "question": "What is 5 + 3?",
                    "hint": "Use your fingers!",
                    "type": "MULTIPLE_CHOICE",
                    "required": true,
                    "options": [
                        { "value": "7", "label": "A" },
                        { "value": "8", "label": "B", "isCorrect": true },
                        { "value": "9", "label": "C" }
                    ],
                    "feedback": "5 + 3 = 8"
                }
            ]
        }
    ]
}
```

### Step 2: Generate form

```bash
node src/createForm.js --quiz my-quiz.json --include-personal-info
```

**First time:** Browser opens → Sign in → Allow permissions → Done!

**Output:**

```
✅ Form created successfully!
🔗 Edit URL: https://docs.google.com/forms/d/.../edit
```

### Step 3: Open and share!

Click the URL to view your form in Google Forms.

---

## 💻 Usage

```bash
# Basic
node src/createForm.js -q quiz.json

# Save to specific folder
node src/createForm.js -q quiz.json -f <folder-id> --include-personal-info

# Try example
node src/createForm.js -q ./src/config/examples/sample-quiz.json
```

**Get folder ID:** Open folder in Drive → Copy ID from URL: `drive.google.com/drive/folders/<ID>`

---

## 📋 JSON Format

### Required fields

- `title`: Quiz title
- `sections[]`: Array of sections
    - `title`: Section title
    - `questions[]`: Array of questions
        - `title`: Question identifier
        - `question`: Question text
        - `type`: `MULTIPLE_CHOICE`, `CHECKBOX`, or `DROPDOWN`
        - `options[]`: Answer options
            - `value`: Option text
            - `label`: Option letter (A, B, C...)
            - `isCorrect`: Mark correct answer(s)

### Optional fields

- `description`: Quiz/section description
- `hint`: Question hint
- `feedback`: Answer explanation
- `required`: Make question mandatory (default: true)

**See [examples](./src/config/examples/) for complete samples.**

---

## 🐛 Troubleshooting

| Issue              | Solution                                                    |
| ------------------ | ----------------------------------------------------------- |
| Access blocked     | Add your email as test user in OAuth consent screen         |
| Connection refused | Add `http://localhost:8080/oauth2callback` to redirect URIs |
| Token expired      | `rm token.json` and run command again                       |

---

## 🔐 Security

**Never commit:**

- `token.json` - OAuth tokens
- `.env` - Configuration
- `client_secret_*.json` - Credentials

Store credentials outside repository (e.g., `~/.config/`).

---

## 📁 Project Structure

```
src/
├── createForm.js          # CLI entry point
├── authUser.js            # OAuth2 flow
├── config/
│   ├── quiz-schema.json   # JSON schema
│   └── examples/          # Sample quizzes
└── utils/
    ├── quizLoader.js      # Validation
    ├── quizParser.js      # API transformation
    ├── questionBuilder.js # Question builder
    └── ...
```

---

## 📄 License

MIT

---

**Happy Crafting! 🎉**
