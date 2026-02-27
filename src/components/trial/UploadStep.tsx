'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, FileSpreadsheet, X, Loader2 } from 'lucide-react';
import Papa from 'papaparse';

interface Props {
  onFileProcessed: (data: Record<string, string>[]) => void;
  isProcessing: boolean;
}

export function UploadStep({ onFileProcessed, isProcessing }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
        setError('Please upload a CSV or Excel file.');
        return;
      }
      setFileName(file.name);

      if (ext === 'csv') {
        Papa.parse<Record<string, string>>(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data.length === 0) {
              setError('File appears to be empty.');
              return;
            }
            onFileProcessed(results.data);
          },
          error: () => {
            setError('Failed to parse CSV file.');
          },
        });
      } else {
        // Excel — use dynamic import to avoid bundling xlsx unless needed
        import('xlsx').then((XLSX) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);
            if (json.length === 0) {
              setError('File appears to be empty.');
              return;
            }
            onFileProcessed(json);
          };
          reader.readAsArrayBuffer(file);
        });
      }
    },
    [onFileProcessed]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  if (isProcessing) {
    return (
      <div className="border border-border rounded-md p-12 text-center bg-card">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
        <p className="font-semibold text-lg mb-1">Analyzing {fileName}...</p>
        <div className="space-y-2 text-sm text-muted-foreground mt-4">
          <p>Scanning for duplicate payments...</p>
          <p>Running Benford&apos;s Law analysis...</p>
          <p>Calculating vendor risk scores...</p>
          <p>Identifying statistical outliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fileName && !error && (
        <div className="flex items-center gap-3 p-3 border border-border rounded-md bg-card">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium flex-1">{fileName}</span>
          <button
            onClick={() => {
              setFileName(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-md p-12 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium mb-1">
          Drag & drop your transaction file here
        </p>
        <p className="text-xs text-muted-foreground">
          Supports CSV and Excel (.xlsx, .xls)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {error && (
        <p className="text-sm text-waste">{error}</p>
      )}

      <p className="text-xs text-muted-foreground">
        Your data is processed locally in your browser. No files are uploaded to any server.
      </p>
    </div>
  );
}
