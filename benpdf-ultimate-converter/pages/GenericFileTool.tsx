import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import { Loader2, CheckCircle, AlertTriangle, Download, Terminal } from 'lucide-react';

interface ToolConfig {
  title: string;
  description: string;
  endpoint: string;
  accept: string;
  supportsUrl: boolean;
  inputLabel?: string;
  extraFields?: React.ReactNode;
  onExtraFieldsChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const GenericFileTool: React.FC<ToolConfig> = ({ 
  title, description, endpoint, accept, supportsUrl, extraFields 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !url) {
      setError("INPUT_REQUIRED: Please upload a file or provide a URL.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else if (url && supportsUrl) {
      formData.append('url', url);
    }
    
    if (extraFields) {
       const form = e.currentTarget as HTMLFormElement;
       const width = (form.elements.namedItem('width') as HTMLInputElement)?.value;
       const height = (form.elements.namedItem('height') as HTMLInputElement)?.value;
       if (width) formData.append('width', width);
       if (height) formData.append('height', height);
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Conversion failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'converted-file';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      } else {
         const type = blob.type;
         if(type.includes('png')) filename += '.png';
         else if(type.includes('pdf')) filename += '.pdf';
         else if(type.includes('docx')) filename += '.docx';
         else if(type.includes('icon')) filename += '.ico';
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pt-4">
      <div className="mb-8 border-l-4 border-indigo-500 pl-6 py-2">
        <h2 className="text-3xl font-bold text-white mb-2 font-mono uppercase tracking-tight">{title}</h2>
        <p className="text-slate-400 font-mono text-sm">// {description}</p>
      </div>

      <div className="bg-slate-900 border border-white/10 relative">
        {/* Tech accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-indigo-500"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-indigo-500"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-indigo-500"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-indigo-500"></div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {supportsUrl && (
              <div className="flex border border-slate-700 bg-slate-900 w-fit">
                <button
                  type="button"
                  onClick={() => { setUrl(''); setFile(null); }}
                  className={`px-6 py-3 text-xs font-bold font-mono uppercase transition-all border-r border-slate-700 ${!url ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => { setFile(null); setUrl('http://'); }}
                  className={`px-6 py-3 text-xs font-bold font-mono uppercase transition-all ${url || (url === '') && !file && url !== undefined ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  URL Import
                </button>
              </div>
            )}

            {(!supportsUrl || (!url && url !== '')) && (
              <FileUploader 
                accept={accept} 
                onFileSelect={(f) => { setFile(f); setUrl(''); }} 
                helperText={`FORMATS: ${accept.replace(/\./g, '').toUpperCase()}`}
              />
            )}

            {supportsUrl && (url !== '' || !file) && (
              <div>
                <label className="block text-xs font-bold text-indigo-400 mb-2 font-mono uppercase">Source URL</label>
                <div className="flex items-center border border-slate-600 bg-slate-800/50">
                   <div className="px-3 text-slate-500"><Terminal size={16}/></div>
                   <input
                    type="url"
                    value={url === 'http://' ? '' : url}
                    onChange={(e) => { setUrl(e.target.value); setFile(null); }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-4 bg-transparent text-white focus:outline-none font-mono text-sm"
                   />
                </div>
              </div>
            )}

            {extraFields && (
              <div className="p-6 bg-slate-800/50 border border-slate-700">
                {extraFields}
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-900/20 text-red-400 border border-red-500/50 flex items-center font-mono text-sm">
                <AlertTriangle size={18} className="mr-3 flex-shrink-0" />
                <span>ERROR: {error}</span>
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-900/20 text-emerald-400 border border-emerald-500/50 flex items-center font-mono text-sm">
                <CheckCircle size={18} className="mr-3 flex-shrink-0" />
                <span>SUCCESS: PROCESS_COMPLETED</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing || (!file && !url)}
              className="w-full flex items-center justify-center py-4 px-6 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 font-mono uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-4 w-4" />
                  PROCESSING...
                </>
              ) : (
                <>
                  <Download className="-ml-1 mr-3 h-4 w-4" />
                  INITIATE SEQUENCE
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GenericFileTool;