import { GoogleGenAI, ApiError } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export interface ToadTaskSnapshot {
  id: string;
  title: string;
  description: string;
  column: string;
  priority: number | null;
  dueAtMs: number | null;
  assignees: string[];
  milestone: string | null;
  tags: string[];
  createdAtMs: number;
  updatedAtMs: number;
  isEncrypted: boolean;
}

export interface ToadBoardSnapshot {
  id: string;
  name: string;
  description: string;
  columns: string[];
  createdAtMs: number;
  tasks: ToadTaskSnapshot[];
}

export async function askToadAssistant(
  userMessage: string,
  snapshot: ToadBoardSnapshot | null,
): Promise<string> {
  if (!ai) {
    return 'TOAD AI is not configured. Please set VITE_GEMINI_API_KEY in your environment.';
  }

  try {
    const boardContext = snapshot
      ? `Current board state:\n${JSON.stringify(snapshot, null, 2)}`
      : 'No board data available.';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        boardContext,
        `User message: ${userMessage}`,
      ],
      config: {
        systemInstruction: `
You are TOAD, the built-in assistant for a Sui-based Kanban app. Be concise, direct, and avoid markdown or decorative formatting. Always stick to what the user asked; do not describe the whole app unless they request it. Respond in plain text.

Rules:
- Keep answers short and focused on the user’s request.
- Do not add bold, bullets, or long overviews unless specifically asked.
- If they ask to create a task: tell them to open Features Kanban from the left sidebar, click Add Task, then fill Summary, Description, Status, Priority, Assignee, Reporter, Tags/Due Date/Milestone, and enable Encryption if needed.
- If they ask to move/edit tasks: open Features Kanban, drag between columns or open the task and edit fields like status/priority/description.
- If they ask about wallet: top-right Connect Wallet; required to push tasks on-chain.
- If they ask about on-chain: tasks can be stored with Sui Move for transparency/immutability; mention encryption option briefly.
- If boardContext is present: summarize counts, empty statuses, missing fields (assignee/description), and offer a short suggestion.
- Offer help only when relevant, with a single short follow-up question.
        `.trim(),
      },
    });

    return response.text || 'No response text from TOAD AI.';
  } catch (error: any) {
    if (error instanceof ApiError) {
      console.error('TOAD AI ApiError:', {
        name: error.name,
        status: error.status,
        message: error.message,
      });
      return `TOAD AI error: [${error.status}] ${error.message}`;
    }

    console.error('TOAD AI error:', error);
    return `TOAD AI error: ${error?.message || 'Unknown error'}.`;
  }
}
