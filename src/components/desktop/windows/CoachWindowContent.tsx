import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Check,
  X,
  RotateCcw,
  Bot,
  User,
  ArrowRight,
  HelpCircle,
  Clock,
  Target,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext.tsx';
import { useTheme } from '../../../context/ThemeContext.tsx';
import { CoachActionProposal } from '../../../types/index.ts';

export const CoachWindowContent: React.FC = () => {
  const {
    coachMessages,
    isCoachLoading,
    sendCoachMessage,
    respondToCoachProposal,
    clearCoachHistory,
    hasAiConfigured,
  } = useApp();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [input, setInput] = useState('');

  const suggestedPrompts = [
    'Help me plan the rest of today.',
    'Why have I been falling behind on this goal?',
    'Break this goal into manageable steps.',
    'Find a realistic time for my next task.',
    'Help me get back on track.',
    'Review my week with me.',
  ];

  const handleSend = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isCoachLoading) return;
    sendCoachMessage(msg);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col justify-between p-4 sm:p-5 text-xs select-none overflow-hidden">
      {/* Top Header & New Conversation */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#67E8F9] flex items-center justify-center text-black font-bold">
            <Sparkles size={14} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Coach</h3>
            <p className="text-[10px] text-[#939BB0]">
              Personal AI adviser grounded in your real goals & schedule.
            </p>
          </div>
        </div>

        <button
          onClick={clearCoachHistory}
          className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[#939BB0] hover:text-white border border-white/10 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          title="Start fresh conversation"
        >
          <RotateCcw size={11} />
          <span>New chat</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {coachMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-[#939BB0]">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] flex items-center justify-center">
              <Bot size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">How can I help you today?</h4>
              <p className="text-xs text-[#939BB0] max-w-xs mt-1">
                Ask for advice on scheduling, breaking down a complex goal, or reviewing your progress.
              </p>
            </div>

            {/* Quick suggested prompt buttons */}
            <div className="flex flex-wrap justify-center gap-1.5 max-w-md pt-2">
              {suggestedPrompts.slice(0, 4).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 text-[11px] transition-colors cursor-pointer text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          coachMessages.map((msg) => {
            if (msg.sender === 'user') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div
                    className={`px-3.5 py-2 rounded-2xl rounded-tr-sm max-w-[85%] text-xs font-medium leading-relaxed ${
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
                  <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>

                  {/* Interactive Action Proposal (if Coach proposed an action) */}
                  {msg.proposal && (
                    <div className="mt-3 p-3 rounded-xl bg-black/30 border border-violet-500/30 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#A78BFA]">
                        <span>Proposed action</span>
                        {msg.proposal.status !== 'pending' && (
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              msg.proposal.status === 'accepted'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-white/10 text-white/50'
                            }`}
                          >
                            {msg.proposal.status}
                          </span>
                        )}
                      </div>

                      <div className="font-semibold text-xs text-white">
                        {msg.proposal.description}
                      </div>

                      {msg.proposal.status === 'pending' && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() =>
                              respondToCoachProposal(msg.proposal!.id, true)
                            }
                            className="px-3 py-1 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-[11px] shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Check size={11} />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() =>
                              respondToCoachProposal(msg.proposal!.id, false)
                            }
                            className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <X size={11} />
                            <span>Dismiss</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isCoachLoading && (
          <div className="flex items-center gap-2 text-[#939BB0] text-[11px] pl-8">
            <span className="w-2 h-2 rounded-full bg-[#67E8F9] animate-ping" />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      {/* Suggested prompts shortcut strip */}
      {coachMessages.length > 0 && (
        <div className="pt-2 flex overflow-x-auto gap-1.5 border-t border-white/5 pb-1">
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#939BB0] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="pt-2 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask Coach anything about your goals or day..."
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
          disabled={isCoachLoading || !input.trim()}
          className="p-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-violet-500/20"
          title="Send message"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
};
