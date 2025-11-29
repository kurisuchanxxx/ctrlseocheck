import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import type { AnalysisResult } from '../types';

interface DetailedResultsProps {
  analysis: AnalysisResult;
}

export default function DetailedResults({ analysis }: DetailedResultsProps) {
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'desktop'>('mobile');
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-dark">Technical SEO</h3>
          <div className="flex gap-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              PageSpeed Insights
            </span>
            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
              Analisi Custom
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            {analysis.technical.ssl.valid ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            )}
            <span>SSL Valido</span>
          </div>
          <div className="flex items-center gap-2">
            {analysis.technical.mobile.friendly ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            )}
            <span>Mobile Friendly</span>
          </div>
          <div className="flex items-center gap-2">
            {analysis.technical.sitemap ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            )}
            <span>Sitemap.xml</span>
          </div>
          <div className="flex items-center gap-2">
            {analysis.technical.robots ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            )}
            <span>Robots.txt</span>
          </div>
        </div>
        {analysis.technical.brokenLinks.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-red-600">
              Link rotti trovati: {analysis.technical.brokenLinks.length}
            </p>
          </div>
        )}
        {analysis.technical.pagespeed && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-dark flex items-center gap-2">
                <span className="text-blue-600">⚡</span>
                PageSpeed Insights
              </h4>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Dati da Google PageSpeed Insights API
              </span>
            </div>
            
            {/* Tabs Mobile/Desktop come PageSpeed Insights */}
            <div className="flex gap-2 mb-4 border-b border-blue-200">
              <button
                onClick={() => setSelectedDevice('mobile')}
                className={`px-4 py-2 font-medium transition-colors ${
                  selectedDevice === 'mobile'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                📱 Dispositivi mobili
              </button>
              <button
                onClick={() => setSelectedDevice('desktop')}
                className={`px-4 py-2 font-medium transition-colors ${
                  selectedDevice === 'desktop'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                💻 Computer
              </button>
            </div>

            {(() => {
              const ps = analysis.technical.pagespeed[selectedDevice];
              return (
                <>
                  {/* Score Cards */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className={`text-2xl font-bold ${
                        ps.performanceScore >= 90 ? 'text-green-600' :
                        ps.performanceScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {ps.performanceScore}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Prestazioni</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className={`text-2xl font-bold ${
                        ps.accessibilityScore >= 90 ? 'text-green-600' :
                        ps.accessibilityScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {ps.accessibilityScore}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Accessibilità</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className={`text-2xl font-bold ${
                        ps.bestPracticesScore >= 90 ? 'text-green-600' :
                        ps.bestPracticesScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {ps.bestPracticesScore}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Best practice</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className={`text-2xl font-bold ${
                        ps.seoScore >= 90 ? 'text-green-600' :
                        ps.seoScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {ps.seoScore}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">SEO</div>
                    </div>
                  </div>

                  {/* Core Web Vitals */}
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <h5 className="font-semibold text-sm mb-3">Core Web Vitals</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">LCP:</span>{' '}
                        <span className={ps.coreWebVitals.lcp < 2500 ? 'text-green-600' : 'text-red-600'}>
                          {ps.coreWebVitals.lcp}ms
                        </span>
                        <span className="text-gray-500 text-xs ml-1">(target: &lt;2500ms)</span>
                      </div>
                      <div>
                        <span className="font-medium">CLS:</span>{' '}
                        <span className={ps.coreWebVitals.cls < 0.1 ? 'text-green-600' : 'text-red-600'}>
                          {ps.coreWebVitals.cls.toFixed(3)}
                        </span>
                        <span className="text-gray-500 text-xs ml-1">(target: &lt;0.1)</span>
                      </div>
                      <div>
                        <span className="font-medium">TBT:</span>{' '}
                        <span className={ps.coreWebVitals.tbt < 200 ? 'text-green-600' : 'text-red-600'}>
                          {ps.coreWebVitals.tbt}ms
                        </span>
                        <span className="text-gray-500 text-xs ml-1">(target: &lt;200ms)</span>
                      </div>
                      <div>
                        <span className="font-medium">FCP:</span>{' '}
                        <span className={ps.metrics.fcp < 1800 ? 'text-green-600' : 'text-red-600'}>
                          {ps.metrics.fcp}ms
                        </span>
                        <span className="text-gray-500 text-xs ml-1">(target: &lt;1800ms)</span>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* AEO/RAO Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-dark flex items-center gap-2">
            <span className="text-purple-600">🤖</span>
            AEO/RAO (Answer Engine Optimization)
          </h3>
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
            FIRST-MOVER: Analisi esclusiva CtrlSEOCheck
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Ottimizzazione per AI e motori di risposta (ChatGPT, Claude, Perplexity, Google AI Overview)
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm font-medium text-gray-700 mb-2">Struttura Q&A</div>
            <div className="flex items-center gap-2">
              {analysis.aeo.qaStructure.present ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500" />
              )}
              <span className="text-sm">{analysis.aeo.qaStructure.sections} sezioni trovate</span>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm font-medium text-gray-700 mb-2">Schema Markup</div>
            <div className="flex items-center gap-2">
              {(analysis.aeo.schema.faq || analysis.aeo.schema.howTo || analysis.aeo.schema.article) ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500" />
              )}
              <span className="text-sm">
                {[analysis.aeo.schema.faq && 'FAQ', analysis.aeo.schema.howTo && 'HowTo', analysis.aeo.schema.article && 'Article'].filter(Boolean).join(', ') || 'Nessuno'}
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm font-medium text-gray-700 mb-2">Contenuti Citabili</div>
            <div className="flex items-center gap-2">
              {(analysis.aeo.citability.statistics || analysis.aeo.citability.sources) ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500" />
              )}
              <span className="text-sm">{analysis.aeo.citability.snippetReady} paragrafi snippet-ready</span>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm font-medium text-gray-700 mb-2">Ottimizzazione Semantica</div>
            <div className="text-sm">
              <div>Profondità: {analysis.aeo.semantic.topicDepth}/20</div>
              <div>Link interni: {analysis.aeo.semantic.internalLinks}</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Lunghezza media frasi:</span>{' '}
              <span className={analysis.aeo.readability.avgSentenceLength < 20 ? 'text-green-600' : 'text-red-600'}>
                {analysis.aeo.readability.avgSentenceLength} parole
              </span>
              <span className="text-gray-500 text-xs ml-1">(target: &lt;20)</span>
            </div>
            <div>
              <span className="font-medium">Paragrafi:</span>{' '}
              <span className={analysis.aeo.readability.avgParagraphLength <= 3 ? 'text-green-600' : 'text-red-600'}>
                {analysis.aeo.readability.avgParagraphLength} frasi/paragrafo
              </span>
              <span className="text-gray-500 text-xs ml-1">(target: 2-3)</span>
            </div>
            <div>
              <span className="font-medium">Keyword in grassetto:</span>{' '}
              <span className="text-blue-600">{analysis.aeo.readability.boldKeywords}</span>
            </div>
            <div>
              <span className="font-medium">Lunghezza contenuto:</span>{' '}
              <span className="text-blue-600">{analysis.aeo.authority.contentLength} parole</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-dark">On-Page SEO</h3>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            Analisi Custom CtrlSEOCheck
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Pagine senza meta title: {
              analysis.onPage.metaTags.title.filter(t => !t.present).length
            }</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pagine senza meta description: {
              analysis.onPage.metaTags.description.filter(d => !d.present).length
            }</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Immagini senza alt text: {
              analysis.onPage.images.withoutAlt
            }</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Struttura Heading: H1={analysis.onPage.headings.h1}, H2={analysis.onPage.headings.h2}, H3={analysis.onPage.headings.h3}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-dark">Local SEO</h3>
          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
            Analisi Custom CtrlSEOCheck
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            {analysis.local.nap.name ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            )}
            <span>Nome presente</span>
          </div>
          <div className="flex items-center gap-2">
            {analysis.local.nap.address ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            )}
            <span>Indirizzo presente</span>
          </div>
          <div className="flex items-center gap-2">
            {analysis.local.nap.phone ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            )}
            <span>Telefono presente</span>
          </div>
          <div className="flex items-center gap-2">
            {analysis.local.localSchema ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            )}
            <span>Schema locale</span>
          </div>
        </div>
        {analysis.local.nap.data && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm"><strong>NAP trovato:</strong></p>
            {analysis.local.nap.data.name && <p className="text-sm">Nome: {analysis.local.nap.data.name}</p>}
            {analysis.local.nap.data.address && <p className="text-sm">Indirizzo: {analysis.local.nap.data.address}</p>}
            {analysis.local.nap.data.phone && <p className="text-sm">Telefono: {analysis.local.nap.data.phone}</p>}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-orange-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-dark">Off-Page SEO</h3>
          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
            Stime Indicative
          </span>
        </div>
        
        {/* Disclaimer importante */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 font-bold text-lg">⚠️</span>
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Dati Stimati, Non Reali</p>
              <p className="text-xs">
                I dati Off-Page SEO (Domain Authority, Backlinks, Directory Listings) sono <strong>stime basate su algoritmi interni</strong>, 
                non valori reali verificati. Per dati accurati, utilizza strumenti professionali come Ahrefs, SEMrush o Moz.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm font-medium text-gray-700 mb-2">Domain Authority</div>
            <div className="text-2xl font-bold text-orange-600">{analysis.offPage.domainAuthority}/100</div>
            <div className="text-xs text-gray-500 mt-1">Stima indicativa</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm font-medium text-gray-700 mb-2">Backlinks Stimati</div>
            <div className="text-2xl font-bold text-orange-600">{analysis.offPage.backlinks}</div>
            <div className="text-xs text-gray-500 mt-1">Stima indicativa</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm font-medium text-gray-700 mb-2">Directory Listings</div>
            <div className="text-2xl font-bold text-orange-600">{analysis.offPage.directoryListings}</div>
            <div className="text-xs text-gray-500 mt-1">Stima indicativa</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm font-medium text-gray-700 mb-2">Google Business Profile</div>
            <div className="flex items-center gap-2">
              {analysis.local.googleBusiness ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500" />
              )}
              <span className="text-sm">{analysis.local.googleBusiness ? 'Presente' : 'Non rilevato'}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Stima basata su schema</div>
          </div>
        </div>
      </div>
    </div>
  );
}

