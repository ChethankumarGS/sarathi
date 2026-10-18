import { Platform } from 'react-native';
import { StudentProfile, studentProfileSchema } from './profile';

function assistantUrl(): string {
  const configured = process.env.EXPO_PUBLIC_ASSISTANT_API_URL;
  return configured || (Platform.OS === 'web' ? '/api/assistant' : '');
}

// True only when the server says AI is switched on. Any failure means "not available", never an error.
export async function isAiAvailable(): Promise<boolean> {
  const url = assistantUrl();
  if (!url) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6_000);
  try {
    const response = await fetch(url, { method: 'GET', signal: controller.signal });
    if (!response.ok) return false;
    const data = await response.json();
    return data?.enabled === true;
  } catch { return false; } finally { clearTimeout(timer); }
}

// One quiet retry for slow or failed AI calls. Not-configured and busy answers are final.
export async function understandProfile(message: string): Promise<StudentProfile> {
  try { return await understandOnce(message); } catch (e) {
    const code = (e as Error).message;
    if (code === 'AI_NOT_CONFIGURED' || code === 'AI_BUSY') throw e;
    return understandOnce(message);
  }
}

async function understandOnce(message: string): Promise<StudentProfile> {
  const configured = process.env.EXPO_PUBLIC_ASSISTANT_API_URL;
  const url = configured || (Platform.OS === 'web' ? '/api/assistant' : '');
  if (!url) throw new Error('AI_NOT_CONFIGURED');
  // Native release builds require HTTPS. Local HTTP is only permitted in development.
  if (configured && !configured.startsWith('https://') && !(typeof __DEV__ !== 'undefined' && __DEV__ && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(configured))) {
    throw new Error('AI_NOT_CONFIGURED');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }), signal: controller.signal,
    });
    if (response.status === 503 || response.status === 404) throw new Error('AI_NOT_CONFIGURED');
    if (response.status === 429) throw new Error('AI_BUSY');
    if (!response.ok) throw new Error('AI_UNAVAILABLE');
    const data = await response.json();
    return studentProfileSchema.parse(data.profile);
  } finally { clearTimeout(timer); }
}
