# 📝 Quiz Crafter

Automate Google Forms creation via CLI using Google Forms API with OAuth2 authentication.

## 🚀 Features

- ✅ OAuth2 user authentication with local callback server
- 📋 Create Google Forms programmatically
- 🔄 Automatic token refresh and storage
- 🎨 Custom form titles and descriptions
- 🔐 Secure credential management

---

## 📦 Prerequisites

- Node.js v18+ (tested on v22.11.0)
- A Google Cloud Project with:
    - Google Forms API enabled
    - Google Drive API enabled
    - OAuth2 credentials configured

---

## 🛠️ Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone <your-repo-url>
cd quiz-crafter
```

### 2️⃣ Install dependencies

```bash
yarn install
# or
npm install
```

### 3️⃣ Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing one)
3. Note your **Project ID**

### 4️⃣ Enable required APIs

Enable these APIs for your project:

- [Google Forms API](https://console.cloud.google.com/apis/library/forms.googleapis.com)
- [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com)

### 5️⃣ Create OAuth2 Credentials

1. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `quiz-crafter-web`
5. Add **Authorized redirect URIs**:
    ```
    http://localhost:8080/oauth2callback
    ```
6. Click **"CREATE"**
7. Download the JSON file

### 6️⃣ Configure OAuth Consent Screen

1. Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Choose **"External"** (or "Internal" if you have Google Workspace)
3. Fill required fields:
    - App name: `Quiz Crafter`
    - User support email: your email
    - Developer contact: your email
4. Add scopes (optional but recommended):
    - `https://www.googleapis.com/auth/forms.body`
    - `https://www.googleapis.com/auth/drive.file`
5. Add **Test users**: your Google account email
6. Save and ensure status is **"Testing"**

### 7️⃣ Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and update:

```bash
# Path to your OAuth2 credentials JSON file
GOOGLE_OAUTH_CLIENT_SECRET=/path/to/your/client_secret_xxx.json

# Your Google Cloud Project ID
GOOGLE_CLOUD_PROJECT=your-project-id

# Optional: Google Drive folder ID where forms will be created
GOOGLE_DRIVE_FOLDER_ID=your-folder-id

# Optional: Quiz configuration
MAX_QUESTIONS=5
QUIZ_JSON_URL=https://example.com/quiz-data.json
```

**Important:** Store the credentials file in a secure location outside the repository (e.g., `~/.config/`).

---

## 🎯 Usage

### Run the test script

```bash
node src/createForm.js
```

**First run:**

1. A browser window will open automatically
2. Sign in with your Google account
3. Review and approve the requested permissions
4. You'll see "Authentication Successful!" in the browser
5. The form will be created automatically

**Subsequent runs:**

- The app will use the saved token from `token.json`
- No browser authentication required (until token expires)

### Output

```
✅ Form created successfully! ID: xxx
🔗 Edit URL: https://docs.google.com/forms/d/xxx/edit
📩 Response URL: https://docs.google.com/forms/d/e/xxx/viewform
```

---

## 📁 Project Structure

```
quiz-crafter/
├── .env                    # Environment variables (not committed)
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
├── README.md               # This file
├── token.json              # OAuth2 tokens (auto-generated, not committed)
└── src/
    ├── authUser.js         # OAuth2 authentication logic
    ├── createForm.js       # Form creation script
    └── index.js            # Service account test (legacy)
```

---

## 🔐 Security Best Practices

### Files that MUST NOT be committed:

- ❌ `token.json` - Contains OAuth2 access tokens
- ❌ `.env` - Contains paths to credentials
- ❌ Any `client_secret_*.json` files
- ❌ Any `*-service-account-key.json` files

### Already protected by `.gitignore`:

```gitignore
.env
token.json
*.json
!package.json
node_modules/
```

### Recommendations:

- Store credentials in `~/.config/` or a secure vault
- Never commit credentials to version control
- Use different credentials for development/production
- Rotate credentials periodically
- Add test users carefully in OAuth consent screen

---

## 🐛 Troubleshooting

### Error: `Access blocked: quiz-crafter has not completed the Google verification process`

**Solution:** Add your email as a Test User in the OAuth consent screen.

1. Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Scroll to **"Test users"**
3. Click **"+ ADD USERS"**
4. Add your Google account email
5. Save and try again

---

### Error: `ERR_CONNECTION_REFUSED` on localhost

**Solution:** Check that redirect URIs are configured correctly.

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth client
3. Add to **"Authorized redirect URIs"**:
    ```
    http://localhost:8080/oauth2callback
    ```
4. Save and download the updated credentials JSON
5. Update the `redirect_uris` array in your credentials file manually if needed

---

### Error: `cannot update document_title`

**Solution:** This is already fixed in the latest version. The `documentTitle` is now set during form creation, not in `batchUpdate`.

---

### Token expired or invalid

**Solution:** Delete the token and re-authenticate.

```bash
rm token.json
node src/createForm.js
```

---

## 📚 API Documentation

- [Google Forms API](https://developers.google.com/forms/api)
- [OAuth2 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google APIs Node.js Client](https://github.com/googleapis/google-api-nodejs-client)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT

---

## 🙋 Support

For issues and questions:

- Check the troubleshooting section above
- Review [Google Forms API documentation](https://developers.google.com/forms/api)
- Open an issue in this repository

---

**Happy Form Crafting! 🎉**
