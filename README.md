# ai-resume-analyzer
AI-powered CV analyzer that evaluates resumes, provides ATS-focused feedback, and generates personalized interview questions.
# CV Checker AI

An AI-powered CV/Resume Analyzer that helps job seekers evaluate their resumes, identify areas for improvement, and prepare for interviews.

## 🚀 Features

* 📄 Resume/CV upload and analysis
* 🤖 AI-powered resume evaluation
* 📊 ATS-focused resume assessment
* 💡 Personalized improvement suggestions
* 🎯 Technical interview question generation
* 🧠 Behavioral interview questions
* 🗺️ Interview preparation roadmap
* 🔐 User authentication
* 📱 Responsive web interface

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS / SCSS
* Axios

### Backend

* Node.js
* Express.js
* REST APIs
* JWT Authentication
* Multer

### Database

* MongoDB
* Mongoose

### AI

* Google Gemini API

### Deployment

* Render
* GitHub

## 🏗️ Project Structure

```text
cv-checker-ai/
│
├── Frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── Backend/
│   ├── src/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/cv-checker-ai.git
cd cv-checker-ai
```

### 2. Install Backend dependencies

```bash
cd Backend
npm install
```

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:

```bash
npm run dev
```

### 3. Install Frontend dependencies

Open another terminal:

```bash
cd Frontend
npm install
```

Create your frontend environment file if required:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

## 🔄 Application Flow

```text
User
  ↓
Upload Resume
  ↓
Backend API
  ↓
Resume Processing
  ↓
Gemini AI Analysis
  ↓
Resume Evaluation
  ↓
Personalized Feedback
  ↓
Interview Questions & Preparation
```

## 🌐 Live Demo

Coming soon.

## 📸 Screenshots

Screenshots will be added after the final UI and deployment are completed.

## 🔮 Future Improvements

* Resume comparison with job descriptions
* Advanced ATS keyword matching
* Resume section scoring
* More detailed interview feedback
* Job-specific interview preparation
* Resume improvement suggestions based on target roles

## 👨‍💻 Author

**Afnan Khan**

B.Tech Computer Science Engineering

---

⭐ If you find this project useful, consider giving it a star!
