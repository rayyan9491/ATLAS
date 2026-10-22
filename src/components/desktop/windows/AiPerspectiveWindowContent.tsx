import React, { useState } from 'react';
import { Sparkles, Send, Check, X } from 'lucide-react';
import { useApp } from '../../../context/AppContext.tsx';
import { useTheme } from '../../../context/ThemeContext.tsx';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendation?: {
    action: string;
    why: string[];
    nextMove: string;
  };
}

export const AiPerspectiveWindowContent: React.FC = () => {
  const { tasks, goals, userStats, todayDate } = useApp();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'user',
      text: 'What should I work on next?',
    },
    {
      id: 'm2',
      sender: 'assistant',
      text: 'Based on your goals and available time, I recommend finishing your Python assignment.',
      recommendation: {
        action: 'Finish Python assignment',
        why: [
          'It is your highest priority task scheduled for today.',
          'It keeps you on track for your Python learning goal.',
          'You have 45 minutes free right now, which fits the task well.',
        ],
        nextMove: 'Start the assignment now (about 25-45 minutes).',
      },
    },
  ]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          userContext: {
            displayName: userStats.displayName,
            level: userStats.level,
            xp: userStats.xp,
            todayDate,
            activeGoals: goals.map((g) => ({ title: g.title, category: g.category })),
            tasks: tasks.slice(0, 5).map((t) => ({
              title: t.title,
              priority: t.priority,
              status: t.status,
            })),
          },
        }),
      });

      const data = await response.json();
      const replyText =
        data.reply ||
        'Looking at your schedule, your highest priority task is ready to start. Take a focused block to finish it first.';

      const botMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: 'Finish your high-priority task first to stay on schedule with your goal.',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between p-4 text-xs">
      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div
                  className={`px-3.5 py-2 rounded-2xl rounded-tr-sm max-w-[85%] text-xs font-medium ${
                    isLight
                      ? 'bg-violet-600 text-white'
                      : 'bg-[#181D2B] text-white border border-white/10'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-violet-500/20 text-[#A78BFA] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={12} />
              </div>

              <div
                className={`p-3.5 rounded-2xl rounded-tl-sm space-y-2.5 flex-1 ${
                  isLight
                    ? 'bg-slate-100 text-slate-800 border border-slate-200'
                    : 'bg-[#121622] text-white border border-white/5'
                }`}
              >
                <div className="leading-relaxed">{msg.text}</div>

                {msg.recommendation && (
                  <div className="space-y-2 pt-1 border-t border-white/5 text-[11px]">
                    <div>
                      <span className="font-bold text-[#A78BFA]">Why:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-[#939BB0] mt-1 pl-1">
                        {msg.recommendation.why.map((reason, idx) => (
                          <li key={idx} className="leading-normal">
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold text-[#67E8F9]">Next move:</span>
                      <div className="text-[#939BB0] mt-0.5">{msg.recommendation.nextMove}</div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {}}
                        className="px-3 py-1 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-[11px] shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={11} />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => {}}
                        className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <X size={11} />
                        <span>Dismiss</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-[#939BB0] text-[11px] pl-8">
            <span className="w-2 h-2 rounded-full bg-[#67E8F9] animate-ping" />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      {/* Suggested quick questions */}
      <div className="pt-2 flex flex-wrap gap-1.5 border-t border-white/5">
        <button
          onClick={() => handleSend('What should I work on next?')}
          className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#939BB0] hover:text-white transition-colors cursor-pointer"
        >
          What should I work on next?
        </button>
        <button
          onClick={() => handleSend('How is my schedule looking for today?')}
          className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#939BB0] hover:text-white transition-colors cursor-pointer"
        >
          Check today's plan
        </button>
      </div>

      {/* Input Field */}
      <div className="pt-2 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className={`flex-1 px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
            isLight
              ? 'bg-white border-slate-300 text-slate-800 focus:border-violet-500'
              : 'bg-[#101420] border-white/10 text-white focus:border-violet-500/50'
          }`}
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="p-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-violet-500/20"
          title="Send"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
};
