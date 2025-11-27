import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { AnalysisRequest } from '../types';

interface AnalysisFormProps {
  onSubmit: (data: AnalysisRequest) => void;
  isLoading: boolean;
}

export default function AnalysisForm({ onSubmit, isLoading }: AnalysisFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<AnalysisRequest & { competitor0?: string; competitor1?: string; competitor2?: string }>();
  const [competitorCount, setCompetitorCount] = useState(0);

  const addCompetitor = () => {
    if (competitorCount < 3) {
      setCompetitorCount(prev => prev + 1);
    }
  };

  const removeCompetitor = () => {
    setCompetitorCount(prev => prev - 1);
  };

  const onFormSubmit = (data: any) => {
    const competitors: string[] = [];
    for (let i = 0; i < competitorCount; i++) {
      const comp = data[`competitor${i}`];
      if (comp && comp.trim()) {
        competitors.push(comp.trim());
      }
    }
    
    onSubmit({
      url: data.url,
      businessSector: data.businessSector,
      targetLocation: data.targetLocation,
      competitors: competitors.length > 0 ? competitors : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-dark">Nuova Analisi SEO</h2>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
          URL del Sito Web *
        </label>
        <input
          type="url"
          id="url"
          {...register('url', { required: 'URL richiesto', pattern: { value: /^https?:\/\/.+/, message: 'URL non valido' } })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="https://example.com"
        />
        {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>}
      </div>

      <div>
        <label htmlFor="businessSector" className="block text-sm font-medium text-gray-700 mb-2">
          Settore Business *
        </label>
        <select
          id="businessSector"
          {...register('businessSector', { required: 'Settore richiesto' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Seleziona settore...</option>
          <option value="ristorante">Ristorante</option>
          <option value="hotel">Hotel</option>
          <option value="artigiano">Artigiano</option>
          <option value="professionista">Professionista</option>
          <option value="negozio">Negozio</option>
          <option value="servizi">Servizi</option>
          <option value="altro">Altro</option>
        </select>
        {errors.businessSector && <p className="mt-1 text-sm text-red-600">{errors.businessSector.message}</p>}
      </div>

      <div>
        <label htmlFor="targetLocation" className="block text-sm font-medium text-gray-700 mb-2">
          Località Target *
        </label>
        <input
          type="text"
          id="targetLocation"
          {...register('targetLocation', { required: 'Località richiesta' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Es: Milano, Lombardia"
        />
        {errors.targetLocation && <p className="mt-1 text-sm text-red-600">{errors.targetLocation.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Competitor (opzionale, max 3)
        </label>
        <div className="space-y-2">
          {Array.from({ length: competitorCount }).map((_, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                {...register(`competitor${index}` as any, { 
                  pattern: { value: /^https?:\/\/.+/, message: 'URL non valido' } 
                })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={`Competitor ${index + 1} URL`}
              />
              <button
                type="button"
                onClick={removeCompetitor}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Rimuovi
              </button>
            </div>
          ))}
          {competitorCount < 3 && (
            <button
              type="button"
              onClick={addCompetitor}
              className="text-sm text-primary hover:underline"
            >
              + Aggiungi Competitor
            </button>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Analisi in corso...' : 'Avvia Analisi'}
      </button>
    </form>
  );
}

