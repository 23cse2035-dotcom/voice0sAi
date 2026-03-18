import { Intent, Emotion, UserContext } from '../types';
import { getResponseTone } from './emotionAnalysis';

export async function generateResponse(
  userInput: string,
  intent: Intent,
  emotion: Emotion,
  context: UserContext
): Promise<string> {
  const tone = getResponseTone(emotion);

  switch (intent) {
    case 'task_create':
      return tone + handleTaskCreation(userInput);
    case 'task_list':
      return tone + 'Let me get your tasks for you.';
    case 'task_complete':
      return tone + 'I will mark that task as completed.';
    case 'explain':
      return tone + await handleExplanation(userInput, emotion, context);
    case 'clarify':
      return tone + await handleClarification(context);
    default:
      return tone + await handleGeneralQuery(userInput);
  }
}

function handleTaskCreation(input: string): string {
  const timeMatch = input.match(/\d{1,2}\s*(am|pm|AM|PM)/);
  const dateMatch = input.match(/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);

  let response = 'I have created a task';

  if (timeMatch) {
    response += ` for ${timeMatch[0]}`;
  }

  if (dateMatch) {
    response += ` on ${dateMatch[0]}`;
  }

  return response + '.';
}

async function handleExplanation(input: string, emotion: Emotion, context: UserContext): Promise<string> {
  const topic = extractTopic(input);

  if (!topic) {
    return 'I can explain various topics. What would you like to learn about?';
  }

  const explanations: Record<string, { simple: string; detailed: string }> = {
    recursion: {
      simple: 'Recursion is when a function calls itself. Think of it like a mirror facing another mirror, creating infinite reflections.',
      detailed: 'Recursion is a programming technique where a function calls itself to solve a problem by breaking it down into smaller instances of the same problem. Each recursive call works on a simpler version until reaching a base case that stops the recursion.',
    },
    dbms: {
      simple: 'A DBMS is like a digital filing cabinet that helps organize and store information efficiently.',
      detailed: 'A Database Management System (DBMS) is software that manages databases. It handles creating, reading, updating, and deleting data while ensuring data integrity, security, and efficient access.',
    },
    algorithm: {
      simple: 'An algorithm is a step-by-step recipe for solving a problem, like following cooking instructions.',
      detailed: 'An algorithm is a well-defined sequence of computational steps that transforms input into output. It provides a systematic approach to problem-solving with clear instructions that can be executed by a computer.',
    },
  };

  const topicLower = topic.toLowerCase();
  const explanation = explanations[topicLower];

  if (explanation) {
    return emotion === 'confused' || context.lastIntent === 'clarify'
      ? explanation.simple
      : explanation.detailed;
  }

  return `${topic} is an important concept in computer science. It involves understanding how systems work together to achieve specific goals.`;
}

async function handleClarification(context: UserContext): Promise<string> {
  if (!context.lastTopic) {
    return 'I can help clarify. What specific part would you like me to explain differently?';
  }

  return `Let me explain ${context.lastTopic} in simpler terms. Think of it as a basic building block that helps solve larger problems.`;
}

async function handleGeneralQuery(input: string): Promise<string> {
  const greetings = ['hello', 'hi', 'hey', 'namaste'];
  const inputLower = input.toLowerCase();

  if (greetings.some(g => inputLower.includes(g))) {
    return 'Hello! I am VoiceOS AI, your intelligent voice assistant. I can help you with tasks, learning, and answering questions. How can I assist you today?';
  }

  return 'I am here to help you. You can ask me to manage tasks, explain concepts, or have a conversation.';
}

function extractTopic(input: string): string {
  const patterns = [
    /(?:what\s+is|explain|define|describe|tell\s+me\s+about)\s+(\w+)/i,
    /(\w+)\s+(?:concept|algorithm|principle)/i,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return '';
}
