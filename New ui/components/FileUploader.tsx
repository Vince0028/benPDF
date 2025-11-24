import React, { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
interface FileUploaderProps {
  accept: string;
  onFileSelect: (file: File) => void;
  label?: string;
  helperText?: string;
}
const FileUploader: React.FC<FileUploaderProps> = ({ accept, onFileSelect, label = "Upload File", helperText }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  const handleFile = (file: File) => {
    setSelectedFile(file);
    onFileSelect(file);
  };
  const clearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  return (
    <div className="w-full">
      <div
        className={`relative flex flex-col items-center justify-center w-full h-48 border border-dashed transition-all duration-200 ease-in-out cursor-pointer group bg-slate-900/50
        ${dragActive 
          ? 'border-indigo-500 bg-indigo-500/10' 
          : 'border-slate-600 hover:border-indigo-400 hover:bg-slate-800/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />
        {selectedFile ? (
          <div className="flex items-center p-4 bg-slate-800 border border-slate-600 shadow-sm z-10 w-full max-w-md mx-4">
            <div className="p-2 bg-indigo-600 mr-3">
              <File className="text-white" size={20} />
            </div>
            <div className="flex-1 max-w-[200px] truncate">
              <p className="text-sm font-bold text-slate-200 font-mono truncate">{selectedFile.name}</p>
              <p className="text-xs text-slate-500 font-mono">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button 
              onClick={clearFile}
              className="ml-3 p-1 hover:bg-red-500/20 hover:text-red-400 rounded-none transition-colors"
            >
              <X size={16} className="text-slate-400 hover:text-red-400" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <div className="p-3 bg-slate-800 mb-3 group-hover:bg-indigo-600 transition-colors duration-200">
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <p className="mb-2 text-sm text-slate-400 font-mono uppercase tracking-wide">
              <span className="font-bold text-indigo-400">Click</span> / Drop File
            </p>
            <p className="text-xs text-slate-500 px-4 font-mono">{helperText || `Supported: ${accept}`}</p>
          </div>
        )}
        {}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-indigo-500/30"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-indigo-500/30"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-indigo-500/30"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-indigo-500/30"></div>
      </div>
    </div>
  );
};
export default FileUploader;