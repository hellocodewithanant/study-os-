import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper: check if Ollama is reachable and list models
async function getOllamaStatus() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { online: false, error: `Ollama returned status ${response.status}` };
    }

    const data = await response.json();
    const models = (data.models || []).map((m) => m.name);
    const hasDefaultModel = models.some(
      (name) => name === DEFAULT_MODEL || name.startsWith(DEFAULT_MODEL.split(':')[0])
    );

    return {
      online: true,
      models,
      modelReady: hasDefaultModel,
      currentModel: DEFAULT_MODEL
    };
  } catch (err) {
    return {
      online: false,
      modelReady: false,
      error: 'Cannot connect to Ollama. Make sure Ollama is installed and running on http://localhost:11434'
    };
  }
}

// 1. Health check endpoint
app.get('/api/ai/health', async (req, res) => {
  const status = await getOllamaStatus();
  res.json(status);
});

// 2. Chat with AI Study Assistant
app.post('/api/ai/chat', async (req, res) => {
  const { messages, subject, topic } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const status = await getOllamaStatus();
  if (!status.online) {
    return res.status(503).json({
      error: 'Ollama service is not running',
      code: 'OLLAMA_OFFLINE',
      suggestion: 'Please start Ollama on your Windows machine or run: ollama serve'
    });
  }

  // Prepend academic tutor system instructions if not present
  const systemPrompt = `You are StudyOS AI, an intelligent, patient, and encouraging academic tutor for a first-year B.Tech Computer Science and Engineering student.
Current Subject context: ${subject || 'Computer Science & Engineering'}.
Current Topic context: ${topic || 'General Academic'}.
Instructions:
- Provide clear, accurate, and easy-to-understand explanations in simple English.
- Use analogies for complex engineering, math, and coding concepts.
- Keep responses well-structured with markdown headings, bullet points, and code snippets where relevant.
- Be encouraging and focus on building strong conceptual foundations.`;

  const finalMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: finalMessages,
        stream: false
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: `Ollama error: ${errText}`,
        code: 'OLLAMA_API_ERROR'
      });
    }

    const data = await response.json();
    res.json({
      message: data.message,
      model: data.model,
      done: data.done
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to communicate with Ollama service',
      details: err.message
    });
  }
});

// 3. Explain Topic in Simple English
app.post('/api/ai/explain', async (req, res) => {
  const { topic, subject } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const status = await getOllamaStatus();
  if (!status.online) {
    return res.status(503).json({ error: 'Ollama service is offline', code: 'OLLAMA_OFFLINE' });
  }

  const prompt = `Please explain the topic "${topic}" in the subject "${subject || 'Computer Science'}".
Provide:
1. 💡 Simple Summary: What is it in plain English? (Use a real-world analogy)
2. 🔑 Core Concepts & Working: How does it work step-by-step?
3. 💻 Code Example / Formula: A clean, minimal code snippet or formula if applicable.
4. ⚠️ Common Student Pitfalls / Exam Tips: What mistakes do 1st-year students often make?`;

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: false
      })
    });

    const data = await response.json();
    res.json({ explanation: data.message?.content || 'No response generated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Generate Practice Quiz & Questions
app.post('/api/ai/quiz', async (req, res) => {
  const { subject, topic, questionCount = 3 } = req.body;

  const status = await getOllamaStatus();
  if (!status.online) {
    return res.status(503).json({ error: 'Ollama service is offline', code: 'OLLAMA_OFFLINE' });
  }

  const prompt = `Create a ${questionCount}-question multiple choice practice quiz for a 1st year B.Tech student on Subject: "${subject}", Topic: "${topic || 'Key Concepts'}".
For each question:
- Provide the Question
- 4 options: A), B), C), D)
- Clearly state the Correct Option
- Provide a brief 1-line explanation of why that option is correct.`;

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: false
      })
    });

    const data = await response.json();
    res.json({ quiz: data.message?.content || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Summarize Study Notes
app.post('/api/ai/summarize', async (req, res) => {
  const { notes, subject } = req.body;
  if (!notes) {
    return res.status(400).json({ error: 'Notes text is required' });
  }

  const status = await getOllamaStatus();
  if (!status.online) {
    return res.status(503).json({ error: 'Ollama service is offline', code: 'OLLAMA_OFFLINE' });
  }

  const prompt = `You are a study summarizer for B.Tech CSE. Summarize the following study notes for Subject: "${subject || 'General'}".
Notes:
"""
${notes}
"""

Format:
- 📌 Key Takeaways (3-5 high-yield bullet points)
- 🧠 Important Terminology & Definitions
- 🎯 Exam Revision Summary (Quick cheat-sheet summary)`;

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: false
      })
    });

    const data = await response.json();
    res.json({ summary: data.message?.content || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Generate Personalized Revision Plan
app.post('/api/ai/revision-plan', async (req, res) => {
  const { subject, daysAvailable = 7, targetHoursPerDay = 3, topics } = req.body;

  const status = await getOllamaStatus();
  if (!status.online) {
    return res.status(503).json({ error: 'Ollama service is offline', code: 'OLLAMA_OFFLINE' });
  }

  const prompt = `Create a structured ${daysAvailable}-day revision timetable for a 1st year CSE student preparing for their "${subject}" assessment.
Daily study capacity: ${targetHoursPerDay} hours/day.
Topics to cover: ${Array.isArray(topics) && topics.length > 0 ? topics.join(', ') : 'Full semester syllabus'}.

Format:
- Day-by-day plan with specific daily goals, active recall tasks, and practice problem recommendations.`;

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: false
      })
    });

    const data = await response.json();
    res.json({ plan: data.message?.content || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`StudyOS AI Backend running on http://localhost:${PORT}`);
  console.log(`Configured Ollama URL: ${OLLAMA_BASE_URL}`);
  console.log(`Configured Model: ${DEFAULT_MODEL}`);
});
