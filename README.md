# 🩺 Medical Report Analyzer

> Turning confusing medical reports into clear, human-readable insights — powered by AI.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![Groq](https://img.shields.io/badge/AI-Groq%20API-orange) ![n8n](https://img.shields.io/badge/Automation-n8n-EA4B71) ![Status](https://img.shields.io/badge/status-active%20development-yellow)

**🔗 Live Demo:** *Coming soon — deployment in progress*

---

## 📌 Overview

Medical lab reports are often filled with abbreviations, numeric ranges, and clinical terminology that the average person can't easily interpret. This creates anxiety and a barrier between patients and understanding their own health.

**Medical Report Analyzer** solves this by letting users upload a lab report (PDF) and instantly receive a clear, plain-language explanation — including a summary, key findings, red flags, and suggested next steps — built using a fast, automated AI pipeline.

This project combines a **Biomedical Engineering** background with **AI/ML engineering** — built end-to-end as a portfolio piece demonstrating both domain understanding and practical software delivery.

---

## ✨ Key Features

- 📄 **PDF Upload** — Clean drag-and-drop interface for medical report PDFs
- 🤖 **AI-Driven Interpretation** — Reports are processed through an automated n8n workflow and analyzed by the Groq API (Llama 3.3 70B)
- ⚡ **Near-Instant Results** — Groq's high-speed LLM inference delivers explanations in ~5–15 seconds
- 🧠 **Structured Plain-Language Output** — Splits AI analysis into Summary, Key Findings, Red Flags, and Next Steps
- 🎨 **Custom "Lab Report" UI** — A distinctive dark-mode interface inspired by diagnostic lab reports, built with Tailwind CSS
- 🔄 **Decoupled Architecture** — Frontend and AI logic are connected via n8n, making it easy to swap models, add OCR, or extend the workflow without touching the core app

---

## 🏗️ How It Works

```
User uploads PDF report
        ↓
   Next.js Frontend (drag-drop UI)
        ↓
   n8n Webhook → Extract PDF Text
        ↓
   Groq API (Llama 3.3 70B) — AI analysis
        ↓
Structured plain-language result returned to UI
(Summary · Key Findings · Red Flags · Next Steps)
```

Keeping the AI workflow in n8n means the analysis logic (prompt, model, response formatting) can be updated independently of the frontend — no redeployment of the app required.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, TypeScript), Tailwind CSS |
| Workflow Automation | n8n (cloud) |
| AI Inference | Groq API — Llama 3.3 70B Versatile |
| PDF Parsing | n8n native "Extract from File" node |
| Deployment | Vercel *(in progress)* |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- An active n8n instance with the analysis workflow published
- A Groq API key (configured inside the n8n workflow)

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

Visit **http://localhost:3000** to use the app.

### Backend Configuration

The frontend sends the uploaded PDF to an n8n webhook endpoint, which extracts the text and forwards it to Groq for analysis. The webhook URL is currently configured directly in `app/page.tsx`.

> **Planned improvement:** move the webhook URL to an environment variable for easier configuration across environments:
> ```
> N8N_WEBHOOK_URL=your_n8n_webhook_endpoint
> ```

---

## 🐞 Lessons Learned (Build Journey)

Building the n8n backend workflow surfaced several non-obvious issues — documenting them here as a reference (and because debugging them taught a lot about how n8n handles binary data, expressions, and webhooks):

1. **Test mode ≠ full pipeline** — n8n's "Listen for test event" only triggers the first node; the full workflow only runs once published.
2. **Pinned mock data silently persists** — once a node's output is "pinned," it keeps returning that mock data until manually unpinned.
3. **Binary field auto-suffixing** — n8n appends `0` to configured binary field names on multipart uploads (`file` → `file0`), which must match downstream node config exactly.
4. **JSON escaping with raw PDF text** — PDF text contains quotes/newlines that break manually-constructed JSON. Fixed by using "Using Fields Below" with the `messages` field in Expression mode, letting n8n handle escaping.
5. **Fixed vs. Expression mode trap** — toggling between modes can silently wipe field content.
6. **Numeric fields default to strings** — `max_tokens: 2048` becomes `"2048"` in "Using Fields Below" mode, which Groq rejects; fixed with Expression mode (`{{ 2048 }}`).
7. **Webhook response expressions** — partial template strings don't work for JSON responses; the full response body must be wrapped in `{{ JSON.stringify({...}) }}`.

---

## 🗺️ Roadmap

- [ ] Deploy live demo on Vercel
- [ ] Move n8n webhook URL to environment variable
- [ ] Add OCR support for scanned/image-based reports
- [ ] Highlight abnormal values directly in the result cards
- [ ] Migrate backend logic to a self-hosted n8n instance or serverless API route (remove reliance on n8n cloud trial)
- [ ] Support multi-report history & comparison

---

## 📦 Project Status

🔧 **Actively in development** — backend (n8n + Groq) fully working end-to-end, frontend complete with custom UI, deployment to Vercel in progress.

---

## 🧑‍💻 About the Author

Built by **Anas Khan**, a Biomedical Engineering student (IIT Hyderabad) exploring the intersection of healthcare and AI/ML — combining domain knowledge with practical software engineering to build tools that make health information more accessible.

GitHub: [@anaskhan58](https://github.com/anaskhan58)

---

## ⚠️ Disclaimer

This tool provides general, AI-generated explanations of medical report content and is **not a substitute for professional medical advice**. Always consult a qualified doctor to interpret your test results and determine appropriate next steps.

---

## 📄 License

This project is open source and available for learning, demonstration, and portfolio purposes.
