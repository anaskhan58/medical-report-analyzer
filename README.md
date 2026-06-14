# 🩺 Medical Report Analyzer

> Turning confusing medical reports into clear, human-readable insights — powered by AI.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Groq](https://img.shields.io/badge/AI-Groq%20API-orange)](https://groq.com/)
[![n8n](https://img.shields.io/badge/Automation-n8n-EA4B71?logo=n8n)](https://n8n.io/)
[![Status](https://img.shields.io/badge/status-active%20development-yellow)]()

---

## 📌 Overview

Medical lab reports are often filled with abbreviations, numeric ranges, and clinical terminology that the average person can't easily interpret. This creates anxiety and a barrier between patients and understanding their own health.

**Medical Report Analyzer** solves this by letting users upload a lab report (PDF or image) and instantly receive a **clear, plain-language explanation** of what the results mean — built using a fast, automated AI pipeline.

---

## ✨ Key Features

- 📄 **Flexible Uploads** — Accepts both PDF and image-based medical reports
- 🤖 **AI-Driven Interpretation** — Reports are processed through an automated **n8n workflow** and analyzed using the **Groq API**
- ⚡ **Near-Instant Results** — Groq's high-speed LLM inference delivers explanations in seconds
- 🧠 **Plain-Language Output** — Converts complex medical jargon into simple, understandable summaries
- 🔄 **Decoupled Architecture** — Frontend and AI processing are connected via automated workflows, making the system easy to extend or swap components

---

## 🏗️ How It Works

```
User uploads report (PDF/Image)
        ↓
   Next.js Frontend
        ↓
   n8n Workflow (orchestration)
        ↓
   Groq API (AI analysis)
        ↓
Plain-language summary returned to user
```

This architecture keeps the **AI logic decoupled from the frontend**, making it easy to update prompts, swap models, or extend the workflow (e.g., add OCR, multi-report comparison, or notifications) without touching the core app.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | [Next.js 14](https://nextjs.org/) (App Router, TypeScript) |
| Workflow Automation | [n8n](https://n8n.io/) |
| AI Inference | [Groq API](https://groq.com/) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- An active **n8n** instance with a configured workflow endpoint
- A **Groq API key**

### Installation

```bash
git clone https://github.com/anaskhan58/medical-report-analyzer.git
cd medical-report-analyzer
npm install
```

### Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the app.

### Environment Variables

Create a `.env.local` file and add:

```env
GROQ_API_KEY=your_groq_api_key
N8N_WEBHOOK_URL=your_n8n_workflow_endpoint
```

---

## 🗺️ Roadmap

- [ ] Deploy live demo on Vercel
- [ ] Add OCR support for scanned/handwritten reports
- [ ] Highlight abnormal values directly in the summary
- [ ] Support multi-report history & comparison
- [ ] Add authentication for saved report history

---

## 📦 Project Status

🔧 Actively in development — currently running locally, with deployment on **Vercel** planned next.

---

## 🧑‍💻 About the Author

Built by **Anas Khan**, a Biomedical Engineering student exploring the intersection of healthcare and AI/ML — combining domain knowledge with practical software engineering to build tools that make health information more accessible.

- GitHub: [@anaskhan58](https://github.com/anaskhan58)

---

## 📄 License

This project is open source and available for learning, demonstration, and portfolio purposes.
