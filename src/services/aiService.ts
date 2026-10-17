const BACKEND_URL = 'http://localhost:5000/api/ai';

export interface OllamaHealthStatus {
  online: boolean;
  modelReady?: boolean;
  models?: string[];
  currentModel?: string;
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function checkAIHealth(): Promise<OllamaHealthStatus> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      return { online: false, error: `Backend returned ${res.status}` };
    }
    return await res.json();
  } catch (err) {
    return {
      online: false,
      error: 'Cannot connect to StudyOS backend on http://localhost:5000. Run "npm run server" to start it.'
    };
  }
}

export async function sendAIChat(
  messages: ChatMessage[],
  subject?: string,
  topic?: string
): Promise<{ text: string; error?: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, subject, topic })
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        text: '',
        error: data.error || data.suggestion || 'AI request failed'
      };
    }
    return { text: data.message?.content || '' };
  } catch (err: any) {
    return { text: '', error: err.message || 'Network error reaching AI backend' };
  }
}

export async function explainTopic(
  topic: string,
  subject?: string
): Promise<{ explanation?: string; error?: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, subject })
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Failed to generate explanation' };
    return { explanation: data.explanation };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function generateQuiz(
  subject: string,
  topic?: string,
  questionCount: number = 3
): Promise<{ quiz?: string; error?: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, topic, questionCount })
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Failed to generate quiz' };
    return { quiz: data.quiz };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function summarizeNotes(
  notes: string,
  subject?: string
): Promise<{ summary?: string; error?: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, subject })
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Failed to summarize notes' };
    return { summary: data.summary };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function generateRevisionPlan(
  subject: string,
  daysAvailable: number,
  targetHoursPerDay: number,
  topics?: string[]
): Promise<{ plan?: string; error?: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/revision-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, daysAvailable, targetHoursPerDay, topics })
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Failed to generate plan' };
    return { plan: data.plan };
  } catch (err: any) {
    return { error: err.message };
  }
}
