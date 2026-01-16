import { useState } from 'react';
import { askToadAssistant, ToadBoardSnapshot } from '../lib/toadAssistant';

export interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export function useToadAssistant(snapshot: ToadBoardSnapshot | null) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Hi! I\'m TOAD, your on-chain workflow assistant. How can I help you with your tasks today?',
      timestamp: Date.now(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', text, timestamp: Date.now() },
    ]);

    setLoading(true);

    try {
      const reply = await askToadAssistant(text, snapshot);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: reply, timestamp: Date.now() },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Sorry, I encountered an error. Please try again.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([
      {
        role: 'assistant',
        text: 'Hi! I\'m TOAD, your on-chain workflow assistant. How can I help you with your tasks today?',
        timestamp: Date.now(),
      },
    ]);
  };

  return { messages, loading, sendMessage, clearMessages };
}
