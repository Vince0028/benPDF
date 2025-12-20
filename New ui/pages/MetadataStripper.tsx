import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import { Loader2, CheckCircle, AlertTriangle, Download, EyeOff } from 'lucide-react';

const MetadataStripper: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        setSuccess(false);
        setDownloadUrl('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/strip-metadata', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Stripping failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            setDownloadUrl(url);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto pt-4 animate-fade-in">
            <div className="mb-8 border-l-4 border-amber-500 pl-6 py-2">
                <h2 className="text-3xl font-bold text-white mb-2 font-mono uppercase tracking-tight">Metadata Strip</h2>
                <div className="flex items-center gap-3">
                    <p className="text-slate-400 font-mono text-sm">Remove EXIF and hidden metadata from images.</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 border border-amber-500/50 text-amber-500 bg-amber-500/10 uppercase font-mono">In Progress</span>
                </div>
            </div>

            <div className="bg-slate-900 border border-white/10 relative">
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-500"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-500"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-500"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-500"></div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="bg-slate-800/30 p-1 border border-white/5">
                            <FileUploader
                                accept=".jpg,.jpeg,.png,.webp,.tiff"
                                onFileSelect={(f) => { setFile(f); setSuccess(false); setDownloadUrl(''); }}
                                helperText="SUPPORTED: JPG, PNG, WEBP, TIFF"
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-900/20 text-red-400 border border-red-500/50 flex items-center font-mono text-sm uppercase">
                                <AlertTriangle size={18} className="mr-3 flex-shrink-0" />
                                <span>Error: {error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-emerald-900/20 text-emerald-400 border border-emerald-500/50 flex items-center font-mono text-sm uppercase">
                                <CheckCircle size={18} className="mr-3 flex-shrink-0" />
                                <span>Process: Metadata_Purged</span>
                            </div>
                        )}

                        {!downloadUrl ? (
                            <button
                                type="submit"
                                disabled={isProcessing || !file}
                                className="w-full flex items-center justify-center py-4 px-6 text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 font-mono uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-700 shadow-lg shadow-amber-600/10"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-3 h-4 w-4" />
                                        Purging...
                                    </>
                                ) : (
                                    <>
                                        <EyeOff className="-ml-1 mr-3 h-4 w-4" />
                                        Initiate Strip
                                    </>
                                )}
                            </button>
                        ) : (
                            <a
                                href={downloadUrl}
                                download={`clean_${file?.name}`}
                                className="w-full flex items-center justify-center py-4 px-6 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 font-mono uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/10"
                            >
                                <Download className="-ml-1 mr-3 h-4 w-4" />
                                Download Cleaned Sequence
                            </a>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MetadataStripper;
