import { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useToadAssistant } from '../../hooks/useToadAssistant';

const quickActions = [
  'Summarize this sprint',
  'Explain blocked tasks',
  'Suggest priorities',
  'Show on-chain changes',
];

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, loading, sendMessage } = useToadAssistant(null);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-600 to-teal-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-white z-40 group"
          title="Ask Sui AI"
        >
          <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-teal-500 rounded-full animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] z-50">
          <Card className="h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between bg-gradient-to-r from-primary-600 to-teal-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Sui AI Assistant</h3>
                  <p className="text-xs text-white/80">Helps you manage your TOAD board</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map(message => (
                <div
                  key={`${message.timestamp}-${message.role}`}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              )}

              {messages.length === 1 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {quickActions.map(action => (
                    <button
                      key={action}
                      onClick={() => handleQuickAction(action)}
                      className="p-3 text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left text-gray-700 dark:text-gray-300"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-dark-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
