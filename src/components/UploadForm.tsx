import React, { useState } from 'react';
import { processExcel } from '../utils/excel';
import { saveVersion } from '../utils/storage';
import { SLAData, Stats } from '../types';

interface UploadFormProps {
  onDataLoaded: (data: SLAData[], stats: Stats) => void;
}

export default function UploadForm({ onDataLoaded }: UploadFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Processar Excel
      const { data, stats } = await processExcel(file);
      
      // Salvar no armazenamento local
      await saveVersion(data, stats);
      
      // Notificar componente pai
      onDataLoaded(data, stats);
    } catch (err) {
      console.error('Erro ao processar arquivo:', err);
      setError('Erro ao processar o arquivo. Verifique o formato e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-form">
      <h2>Upload de Planilha SLA</h2>
      
      <div className="upload-container">
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          disabled={loading}
          className="file-input"
        />
        
        {loading && <p className="loading">Processando arquivo...</p>}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
