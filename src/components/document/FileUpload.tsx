import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, CloudUpload } from 'lucide-react';
import type { UploadedFile, DocumentFileType } from '@/types/document.types';
import clsx from 'clsx';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  acceptedTypes?: DocumentFileType[];
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  className?: string;
}

const FILE_TYPE_ICONS: Record<DocumentFileType, any> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
  json: FileText,
  csv: FileText,
  md: FileText,
  html: FileText,
};

const FILE_TYPE_COLORS: Record<DocumentFileType, { bg: string; text: string; border: string }> = {
  pdf: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  doc: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  docx: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  txt: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  json: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  csv: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  md: { bg: 'bg-accent-500/10', text: 'text-accent-400', border: 'border-accent-500/20' },
  html: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
};

export function FileUpload({
  onFileSelect,
  acceptedTypes = ['pdf', 'doc', 'docx', 'txt', 'json', 'csv', 'md', 'html'],
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  multiple = true,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileType = (fileName: string): DocumentFileType => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return ext as DocumentFileType;
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    const fileType = getFileType(file.name);
    if (!acceptedTypes.includes(fileType)) {
      return {
        valid: false,
        error: `File type ${fileType} is not supported`,
      };
    }

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${formatFileSize(maxSize)} limit`,
      };
    }

    return { valid: true };
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [acceptedTypes, maxSize, maxFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      processFiles(files);
    },
    [acceptedTypes, maxSize, maxFiles]
  );

  const processFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const newErrors: Record<string, string> = {};

    files.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        newErrors[file.name] = validation.error || 'Invalid file';
      }
    });

    // Check max files limit
    if (uploadedFiles.length + validFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploadErrors((prev) => ({ ...prev, ...newErrors }));

    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
    setUploadErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fileId];
      return newErrors;
    });
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const acceptedTypesString = acceptedTypes
    .map((type) => `.${type}`)
    .join(',');

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={clsx(
          'relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 group cursor-pointer',
          isDragging
            ? 'border-accent-500 bg-accent-500/10 shadow-[0_0_30px_rgba(139,92,246,0.15)]'
            : 'border-white/10 hover:border-accent-500/30 hover:bg-white/[0.02] bg-slate-800/50 backdrop-blur-md'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypesString}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="text-center">
          <div
            className={clsx(
              'w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 border',
              isDragging
                ? 'bg-accent-500 scale-110 border-accent-400 shadow-[0_0_30px_rgba(139,92,246,0.5)]'
                : 'bg-accent-500/10 border-accent-500/20 group-hover:bg-accent-500/20 group-hover:scale-105'
            )}
          >
            <CloudUpload
              className={clsx(
                'w-10 h-10 transition-colors',
                isDragging ? 'text-white' : 'text-accent-400'
              )}
            />
          </div>

          <h3 className="text-xl font-black font-headline text-white mb-2">
            {isDragging ? 'Drop files here' : 'Upload your documents'}
          </h3>

          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            Drag and drop files here, or{' '}
            <span className="text-accent-400 font-bold hover:text-accent-300 transition-colors underline underline-offset-4 decoration-accent-500/40">
              browse
            </span>{' '}
            to select
          </p>

          {/* File Format Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {acceptedTypes.map((type) => {
              const colors = FILE_TYPE_COLORS[type];
              return (
                <span
                  key={type}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase border',
                    colors?.bg || 'bg-white/5',
                    colors?.text || 'text-slate-400',
                    colors?.border || 'border-white/5'
                  )}
                >
                  {type}
                </span>
              );
            })}
          </div>

          <div className="text-xs font-bold text-slate-600 tracking-wider uppercase">
            Max file size: {formatFileSize(maxSize)}
            {maxFiles > 1 && ` • Max ${maxFiles} files`}
          </div>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Uploaded Files ({uploadedFiles.length})
          </h4>

          {uploadedFiles.map((file) => {
            const fileType = getFileType(file.name);
            const Icon = FILE_TYPE_ICONS[fileType] || FileText;
            const colors = FILE_TYPE_COLORS[fileType];
            const progress = uploadProgress[file.id] || 0;
            const error = uploadErrors[file.name];

            return (
              <div
                key={file.id}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all shadow-lg"
              >
                <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center border', colors?.bg, colors?.border)}>
                  <Icon className={clsx('w-6 h-6', colors?.text)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-white truncate">
                      {file.name}
                    </p>
                    {error && (
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                    {progress === 100 && !error && (
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-bold tracking-wider">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{new Date(file.uploadedAt).toLocaleTimeString()}</span>
                  </div>

                  {error && (
                    <p className="text-xs text-rose-400 font-medium mt-1">{error}</p>
                  )}

                  {progress > 0 && progress < 100 && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-accent-500 to-fuchsia-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {progress === 100 && !error ? (
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-2.5 rounded-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors border border-transparent hover:border-rose-500/20"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : progress > 0 && progress < 100 ? (
                  <Loader2 className="w-5 h-5 text-accent-400 animate-spin" />
                ) : (
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-2.5 rounded-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors border border-transparent hover:border-rose-500/20"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
