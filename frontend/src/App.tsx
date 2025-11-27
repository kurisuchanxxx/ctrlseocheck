import { useState, useEffect } from 'react';
import AnalysisForm from './components/AnalysisForm';
import ScoreGauge from './components/ScoreGauge';
import RecommendationsList from './components/RecommendationsList';
import QuickWins from './components/QuickWins';
import ProgressBar from './components/ProgressBar';
import HistoryList from './components/HistoryList';
import DetailedResults from './components/DetailedResults';
import { analysisApi } from './services/api';
import { generatePDF } from './utils/pdfGenerator';
import type { AnalysisRequest, AnalysisResult } from './types';

const PROGRESS_STEPS = [
  'Connessione al sito...',
  'Analisi PageSpeed Insights (mobile + desktop)...',
  'Analisi Technical SEO...',
  'Analisi On-Page SEO...',
  'Analisi Local SEO...',
  'Analisi Off-Page SEO...',
  'Analisi AEO/RAO (Answer Engine Optimization)...',
  'Analisi competitor...',
  'Generazione raccomandazioni...',
  'Completamento...',
];

function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await analysisApi.getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleAnalyze = async (request: AnalysisRequest) => {
    setIsLoading(true);
    setProgressStep(0);
    setCurrentAnalysis(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgressStep(prev => {
          if (prev < PROGRESS_STEPS.length - 1) {
            return prev + 1;
          }
          clearInterval(progressInterval);
          return prev;
        });
      }, 2000);

      const result = await analysisApi.analyze(request);
      clearInterval(progressInterval);
      setProgressStep(PROGRESS_STEPS.length - 1);
      setCurrentAnalysis(result);
      await loadHistory();
    } catch (error: any) {
      console.error('Analysis error:', error);
      alert(`Errore durante l'analisi: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
      setProgressStep(0);
    }
  };

  const handleGeneratePDF = async () => {
    if (!currentAnalysis) return;
    try {
      await generatePDF(currentAnalysis);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Errore durante la generazione del PDF');
    }
  };

  const handleSelectHistory = async (analysis: AnalysisResult) => {
    setCurrentAnalysis(analysis);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-primary">CtrlSEOCheck</h1>
              <span className="text-sm text-gray-500">by Ctrl Studio</span>
            </div>
            <div className="flex items-center gap-4">
              <img 
                src="/ctrl-studio-logo.svg" 
                alt="Ctrl Studio" 
                className="h-10 w-auto"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-4 py-2 text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                >
                  {showHistory ? 'Nuova Analisi' : 'Storico'}
                </button>
                {currentAnalysis && (
                  <button
                    onClick={handleGeneratePDF}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Genera PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showHistory ? (
          <HistoryList history={history} onSelect={handleSelectHistory} />
        ) : isLoading ? (
          <ProgressBar steps={PROGRESS_STEPS} currentStep={progressStep} />
        ) : currentAnalysis ? (
          <div className="space-y-6">
            <ScoreGauge analysis={currentAnalysis} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DetailedResults analysis={currentAnalysis} />
              <div className="space-y-6">
                <QuickWins quickWins={currentAnalysis.summary.quickWins} />
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-dark mb-4">Riepilogo</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Pagine analizzate:</strong> {currentAnalysis.summary.totalPages}</p>
                    <p><strong>Problemi trovati:</strong> {currentAnalysis.summary.totalIssues}</p>
                    <p><strong>Tempo stimato implementazione:</strong> {currentAnalysis.summary.estimatedTime}</p>
                  </div>
                </div>
              </div>
            </div>
            <RecommendationsList recommendations={currentAnalysis.recommendations} />
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentAnalysis(null)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Nuova Analisi
              </button>
            </div>
          </div>
        ) : (
          <AnalysisForm onSubmit={handleAnalyze} isLoading={isLoading} />
        )}
      </main>

      <footer className="bg-dark text-white mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">CtrlSEOCheck by Ctrl Studio - Analisi SEO automatica per PMI locali</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
