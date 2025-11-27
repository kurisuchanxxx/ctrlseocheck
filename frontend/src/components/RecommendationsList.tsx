import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon, CodeBracketIcon, LinkIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import type { Recommendation } from '../types';

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export default function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const [expandedRecs, setExpandedRecs] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRecs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRecs(newExpanded);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <InformationCircleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-green-500 bg-green-50';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'facile':
        return 'bg-green-100 text-green-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'avanzata':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedRecs = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-dark mb-4">Raccomandazioni Dettagliate</h3>
      {sortedRecs.map((rec) => {
        const isExpanded = expandedRecs.has(rec.id);
        const hasDetails = rec.codeExamples || rec.resources || rec.metrics || rec.difficulty || rec.estimatedTime;
        
        return (
          <div
            key={rec.id}
            className={`border-l-4 rounded-lg p-6 ${getPriorityColor(rec.priority)} transition-all`}
          >
            <div className="flex items-start gap-3">
              {getPriorityIcon(rec.priority)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-dark text-lg">{rec.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      rec.priority === 'high' ? 'bg-red-200 text-red-800' :
                      rec.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Bassa'}
                    </span>
                    {rec.difficulty && (
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getDifficultyColor(rec.difficulty)}`}>
                        {rec.difficulty === 'facile' ? '⚡ Facile' : rec.difficulty === 'media' ? '🔧 Media' : '⚙️ Avanzata'}
                      </span>
                    )}
                    {rec.estimatedTime && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {rec.estimatedTime}
                      </span>
                    )}
                  </div>
                  {hasDetails && (
                    <button
                      onClick={() => toggleExpand(rec.id)}
                      className="text-primary hover:text-blue-700 text-sm font-medium"
                    >
                      {isExpanded ? 'Nascondi dettagli' : 'Mostra dettagli'}
                    </button>
                  )}
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">{rec.description}</p>

                {/* Metriche */}
                {rec.metrics && (
                  <div className="mb-4 p-3 bg-white rounded border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <ChartBarIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-gray-700">Metriche</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {rec.metrics.current && (
                        <div>
                          <span className="text-gray-600">Attuale:</span>{' '}
                          <span className="font-semibold text-red-600">{rec.metrics.current}</span>
                          {rec.metrics.unit && <span className="text-gray-500 ml-1">{rec.metrics.unit}</span>}
                        </div>
                      )}
                      {rec.metrics.target && (
                        <div>
                          <span className="text-gray-600">Target:</span>{' '}
                          <span className="font-semibold text-green-600">{rec.metrics.target}</span>
                          {rec.metrics.unit && <span className="text-gray-500 ml-1">{rec.metrics.unit}</span>}
                        </div>
                      )}
                      {rec.metrics.improvement && (
                        <div className="col-span-2 pt-2 border-t border-gray-200">
                          <span className="text-gray-600">Miglioramento atteso:</span>{' '}
                          <span className="font-semibold text-primary">{rec.metrics.improvement}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Risorse coinvolte */}
                {rec.affectedResources && rec.affectedResources.length > 0 && (
                  <div className="mb-4 text-sm text-gray-600">
                    <span className="font-medium">Risorse coinvolte:</span>{' '}
                    {rec.affectedResources.join(', ')}
                  </div>
                )}

                {/* Passi da seguire */}
                {rec.steps.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Passi da seguire:</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                      {rec.steps.map((step, index) => (
                        <li key={index} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Dettagli espandibili */}
                {isExpanded && hasDetails && (
                  <div className="mt-4 space-y-4 pt-4 border-t border-gray-300">
                    {/* Esempi di codice */}
                    {rec.codeExamples && rec.codeExamples.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CodeBracketIcon className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold text-gray-700">Esempi di Codice</span>
                        </div>
                        <div className="space-y-2">
                          {rec.codeExamples.map((code, index) => (
                            <pre key={index} className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                              <code>{code}</code>
                            </pre>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risorse utili */}
                    {rec.resources && rec.resources.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <LinkIcon className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold text-gray-700">Risorse Utili</span>
                        </div>
                        <ul className="space-y-2">
                          {rec.resources.map((resource, index) => (
                            <li key={index} className="text-sm">
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-blue-700 hover:underline font-medium"
                              >
                                {resource.title}
                              </a>
                              {resource.description && (
                                <span className="text-gray-600 ml-2">- {resource.description}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Impatto */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-sm">
                    <span className="font-semibold text-gray-700">Impatto stimato:</span>{' '}
                    <span className="text-primary font-medium">{rec.impact}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

