import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome to TOAD
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                About TOAD
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                TOAD (Task On-chain Agile Dashboard) is a decentralized project management
                platform built for the Sui Builder Forge hackathon. It leverages Sui Move smart
                contracts to provide transparent, immutable task tracking with on-chain ownership
                and permissions.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                How It Works
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                TOAD uses Sui's object model to create boards, tasks, and team memberships
                on-chain. Each board is a Sui object with configurable workflows, role-based
                access control, and support for subtasks, comments, and emoji reactions. The AI
                assistant helps you manage tasks and analyze progress.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Getting Started
              </h3>
              <div className="space-y-3">
                {[
                  'Connect your Sui wallet or use zkLogin with Google',
                  'Create your first board with custom columns',
                  'Add team members and assign roles (Contributor or Admin)',
                  'Start creating tasks with assignees, priorities, and due dates',
                  'Use the AI assistant for smart suggestions and insights',
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-600 dark:text-gray-400">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Features
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>On-chain boards and tasks</li>
                    <li>Role-based permissions</li>
                    <li>Subtasks and comments</li>
                    <li>Emoji reactions</li>
                    <li>Client-side encryption</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Tech Stack
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>Sui Move 2024</li>
                    <li>Sui TypeScript SDK</li>
                    <li>zkLogin integration</li>
                    <li>Google Gemini AI</li>
                    <li>React + TypeScript</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button onClick={onClose}>Got it</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
