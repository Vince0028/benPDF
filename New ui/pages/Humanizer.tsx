
import React, { useState } from 'react';

const Humanizer: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                body: JSON.stringify({ text: inputText }),
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

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">AI Humanizer</h1>
                <p className="mt-2 text-gray-600">Transform AI-generated text into natural, human-like writing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
                <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700">Input Text</label>
                    <textarea
                        className="flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Paste your AI-generated text here..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                </div>

                <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700">Humanized Result</label>
                    <div className="flex-1 w-full p-4 bg-gray-50 border border-gray-200 rounded-lg overflow-auto whitespace-pre-wrap">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <span className="animate-pulse">Humanizing...</span>
                            </div>
                        ) : error ? (
                            <div className="text-red-500">{error}</div>
                        ) : outputText ? (
                            <div className="text-gray-800">{outputText}</div>
                        ) : (
                            <div className="text-gray-400 italic">Result will appear here...</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handleHumanize}
                    disabled={isLoading || !inputText.trim()}
                    className={`px-8 py-3 rounded-full text-white font-medium transition-all ${isLoading || !inputText.trim()
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                        }`}
                >
                    {isLoading ? 'Processing...' : 'Humanize Text'}
                </button>
            </div>
        </div>
    );
};

export default Humanizer;
