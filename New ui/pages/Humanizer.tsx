import React, { useState } from 'react';
import { Sparkles, Bot, User, Copy, Check, Loader2, AlertTriangle, Trash2 } from 'lucide-react';

const Humanizer: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [inputCopied, setInputCopied] = useState(false);

    const [mode, setMode] = useState<'informal' | 'formal'>('informal');

    const handleHumanize = async () => {
        if (!inputText.trim()) return;

        setIsLoading(true);
        setError(null);
        setOutputText('');

        try {
            const response = await fetch('/api/humanize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: inputText, mode }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to humanize text');
            }

            const data = await response.json();
            setOutputText(data.result);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!outputText) return;
        navigator.clipboard.writeText(outputText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyInput = () => {
        if (!inputText) return;
        navigator.clipboard.writeText(inputText);
        setInputCopied(true);
        setTimeout(() => setInputCopied(false), 2000);
    };

    const handleClear = () => {
        setInputText('');
        setError(null);
        // Optionally clear output too? probably not, users might want to keep the result while clearing input.
    };

    return (
        <div className="max-w-6xl mx-auto pt-4">
            {/* Header Section */}
            <div className="mb-8 flex items-end justify-between border-l-4 border-green-500 pl-6 py-2">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 font-mono uppercase tracking-tight">AI Humanizer</h2>
                    <p className="text-slate-400 font-mono text-sm">NEURAL TEXT RE-SYNTHESIS MODULE</p>
                </div>

                {/* Mode Toggles */}
                <div className="flex bg-slate-800 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setMode('informal')}
                        className={`px-4 py-2 rounded font-mono text-xs uppercase tracking-wider transition-all ${mode === 'informal'
                                ? 'bg-green-500 text-slate-900 font-bold shadow-lg shadow-green-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Informal
                    </button>
                    <button
                        onClick={() => setMode('formal')}
                        className={`px-4 py-2 rounded font-mono text-xs uppercase tracking-wider transition-all ${mode === 'formal'
                                ? 'bg-blue-500 text-slate-900 font-bold shadow-lg shadow-blue-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Formal
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[calc(100vh-250px)] min-h-[600px]">
                {/* Input Section */}
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-green-400 font-mono uppercase flex items-center gap-2">
                            <Bot size={16} />
                            Source Input (AI)
                        </label>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 font-mono">{inputText.length} chars</span>
                            {inputText && (
                                <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
                                    <button
                                        onClick={handleCopyInput}
                                        className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors uppercase font-mono"
                                        title="Copy Input"
                                    >
                                        {inputCopied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                    </button>
                                    <button
                                        onClick={handleClear}
                                        className="text-xs flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors uppercase font-mono"
                                        title="Clear Input"
                                    >
                                        <Trash2 size={12} />
                                        CLEAR
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="relative flex-1 bg-slate-900 border border-white/10 p-1 group focus-within:border-green-500/50 transition-colors">
                        {/* Decorators */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-focus-within:border-green-500/50"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-focus-within:border-green-500/50"></div>

                        <textarea
                            className="w-full h-full p-4 bg-slate-800/50 text-slate-300 font-mono text-sm resize-none focus:outline-none placeholder-slate-600 custom-scrollbar"
                            placeholder="// Paste robotic/AI-generated text here for processing..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleHumanize}
                        disabled={isLoading || !inputText.trim()}
                        className="
                            w-full mt-4 group relative overflow-hidden px-8 py-4 bg-green-600 hover:bg-green-500 
                            text-white font-bold font-mono uppercase tracking-wider transition-all 
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800
                        "
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-shimmer"></div>
                        <span className="relative flex items-center justify-center gap-3">
                            {isLoading ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    Execute Humanization
                                </>
                            )}
                        </span>
                    </button>
                </div>

                {/* Output Section */}
                <div className="flex flex-col h-full mt-6 lg:mt-0">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-green-400 font-mono uppercase flex items-center gap-2">
                            <User size={16} />
                            Humanized Output
                        </label>
                        {outputText && (
                            <button
                                onClick={handleCopy}
                                className="text-xs flex items-center gap-1 bg-green-900/30 hover:bg-green-900/50 text-green-400 px-2 py-1 rounded transition-colors uppercase font-mono border border-green-500/30"
                            >
                                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                {copied ? 'COPIED' : 'COPY OUTPUT'}
                            </button>
                        )}
                    </div>
                    <div className="relative flex-1 bg-slate-900 border border-white/10 p-1">
                        {/* Decorators */}
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20"></div>

                        <div className="w-full h-full bg-slate-800/50 relative overflow-hidden">
                            {isLoading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse"></div>
                                        <Loader2 className="relative z-10 w-12 h-12 text-green-500 animate-spin" />
                                    </div>
                                    <div className="font-mono text-xs text-green-400 uppercase tracking-widest animate-pulse">
                                        Synthesizing Natural Patterns...
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="absolute inset-0 flex items-center justify-center p-8">
                                    <div className="bg-red-900/20 border border-red-500/30 p-6 max-w-md w-full">
                                        <div className="flex items-center gap-3 text-red-500 mb-2">
                                            <AlertTriangle size={20} />
                                            <h3 className="font-mono font-bold uppercase">Processing Error</h3>
                                        </div>
                                        <p className="font-mono text-sm text-red-400/80">{error}</p>
                                    </div>
                                </div>
                            ) : outputText ? (
                                <div className="p-6 h-full overflow-y-auto custom-scrollbar">
                                    <p className="font-serif text-lg leading-relaxed text-slate-200 whitespace-pre-wrap">
                                        {outputText}
                                    </p>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                                    <div className="text-center">
                                        <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="font-mono text-xs uppercase tracking-widest opacity-50">Waiting for input stream</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Humanizer;
