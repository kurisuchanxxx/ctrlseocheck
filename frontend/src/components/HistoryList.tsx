import { ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import type { AnalysisResult } from '../types';

interface HistoryListProps {
  history: AnalysisResult[];
  onSelect: (analysis: AnalysisResult) => void;
}

export default function HistoryList({ history, onSelect }: HistoryListProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-dark mb-4">Storico Analisi</h3>
      {history.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nessuna analisi precedente</p>
      ) : (
        <div className="space-y-3">
          {history.map((analysis) => (
            <button
              key={analysis.id}
              onClick={() => onSelect(analysis)}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-dark truncate max-w-xs">
                    {analysis.url.replace(/https?:\/\//, '')}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}/100
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ClockIcon className="h-4 w-4" />
                <span>{dayjs(analysis.timestamp).format('DD/MM/YYYY HH:mm')}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

