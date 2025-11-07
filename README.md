# 📝 Quiz Crafter

Automate Google Forms quiz creation from JSON via CLI with OAuth2 authentication.

## ✨ Features

- 📋 Create quizzes from JSON files
- ✅ Multiple choice questions with grading
- 💡 Support for hints and explanations
- 📁 Organize forms in Google Drive folders
- 🔐 Secure OAuth2 authentication

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js v18+
- Google Cloud Project with Forms API and Drive API enabled
- OAuth2 credentials configured

### 2. Install

```bash
git clone <repo-url>
cd quiz-crafter
yarn install
cp .env.example .env
```

### 3. Setup Google Cloud

1. **Enable APIs**: [Forms API](https://console.cloud.google.com/apis/library/forms.googleapis.com) and [Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com)
2. **Create OAuth2 credentials**:
    - Go to [Credentials](https://console.cloud.google.com/apis/credentials)
    - Create OAuth client ID → Web application
    - Add redirect URI: `http://localhost:8080/oauth2callback`
    - Download JSON credentials
3. **Configure OAuth consent screen**:
    - Add yourself as test user
    - Set status to "Testing"

### 4. Configure `.env`

```bash
GOOGLE_OAUTH_CLIENT_SECRET=/path/to/client_secret.json
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_DRIVE_FOLDER_ID=your-folder-id  # Optional
```

---

## 💻 Usage

### Create quiz from JSON

```bash
# Basic usage
node src/createForm.js --quiz ./src/config/examples/sample-quiz.json

# With specific Google Drive folder
node src/createForm.js -q ./quiz.json -f 1R2gG0ztLSSTEjDdTrjFFlTi_FThPUtaM

# Short flags
node src/createForm.js -q quiz.json -f folder-id
```

**CLI Arguments:**

- `--quiz, -q`: Path to quiz JSON file (required)
- `--folder, -f`: Google Drive folder ID (optional, uses `.env` if not set)

**Find folder ID:** Open folder in Drive, copy ID from URL: `drive.google.com/drive/folders/<ID>`

---

## 📋 Quiz JSON Format

```json
{
    "title": "My Quiz",
    "description": "Quiz description",
    "sections": [
        {
            "title": "Section 1",
            "description": "Instructions",
            "questions": [
                {
                    "title": "Question 1",
                    "question": "What is 2+2?",
                    "hint": "Count on your fingers",
                    "type": "MULTIPLE_CHOICE",
                    "required": true,
                    "options": [
                        { "value": "3", "label": "A" },
                        { "value": "4", "label": "B", "isCorrect": true },
                        { "value": "5", "label": "C" }
                    ],
                    "feedback": "2+2 equals 4"
                }
            ]
        }
    ]
}
```

**Question types:** `MULTIPLE_CHOICE`, `CHECKBOX`, `DROPDOWN`

See [examples](./src/config/examples/) for more.

---

## 📁 Project Structure

```
quiz-crafter/
├── src/
│   ├── createForm.js          # Main entry point
│   ├── authUser.js            # OAuth2 authentication
│   ├── config/
│   │   ├── quiz-schema.json   # JSON schema
│   │   └── examples/          # Example quizzes
│   └── utils/
│       ├── quizLoader.js      # Load & validate JSON
│       ├── quizParser.js      # Parse to Forms API
│       ├── questionBuilder.js # Build questions
│       ├── formHelpers.js     # API helpers
│       ├── logger.js          # Logging utilities
│       └── urlBuilder.js      # URL builders
└── .env                       # Configuration (not committed)
```

---

## 🔐 Security

**Never commit:**

- ❌ `token.json` - OAuth2 tokens
- ❌ `.env` - Configuration
- ❌ `client_secret_*.json` - Credentials

Store credentials in `~/.config/` or secure vault.

---

## 🐛 Troubleshooting

### `Access blocked: app has not completed verification`

→ Add your email as test user in [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)

### `ERR_CONNECTION_REFUSED`

→ Add `http://localhost:8080/oauth2callback` to authorized redirect URIs

### `Token expired`

→ Delete token and re-authenticate: `rm token.json && node src/createForm.js -q quiz.json`

### `Invalid grading`

→ Fixed in latest version - quiz mode is enabled automatically

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m "feat: add amazing feature"`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT

---

**Happy Form Crafting! 🎉**
