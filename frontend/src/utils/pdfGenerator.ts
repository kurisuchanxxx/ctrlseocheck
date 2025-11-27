import jsPDF from 'jspdf';
import type { AnalysisResult } from '../types';

export async function generatePDF(analysis: AnalysisResult): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFillColor(17, 109, 248);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  
  // Logo Ctrl Studio (alto a destra)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Ctrl Studio', pageWidth - 60, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('CtrlSEOCheck', pageWidth - 60, 30);
  
  // Titolo principale
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('SEO Audit Report', 20, 25);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date(analysis.timestamp).toLocaleDateString()}`, 20, 35);

  yPosition = 50;

  // Executive Summary
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.text('Executive Summary', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.text(`Website: ${analysis.url}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Overall Score: ${analysis.score}/100`, 20, yPosition);
  yPosition += 7;
  doc.text(`Total Issues Found: ${analysis.summary.totalIssues}`, 20, yPosition);
  yPosition += 15;

  // Score Breakdown
  doc.setFontSize(16);
  doc.text('Score Breakdown', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.text(`Technical SEO: ${analysis.technical.score}/25`, 20, yPosition);
  yPosition += 6;
  doc.text(`On-Page SEO: ${analysis.onPage.score}/25`, 20, yPosition);
  yPosition += 6;
  doc.text(`Local SEO: ${analysis.local.score}/20`, 20, yPosition);
  yPosition += 6;
  doc.text(`Off-Page SEO: ${analysis.offPage.score}/10`, 20, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(168, 85, 247); // Purple per AEO
  doc.text(`AEO/RAO: ${analysis.aeo.score}/20 (FIRST-MOVER)`, 20, yPosition);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  yPosition += 15;

  // PageSpeed Insights Section
  if (analysis.technical.pagespeed) {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PageSpeed Insights (Google API)', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const psMobile = analysis.technical.pagespeed.mobile;
    doc.text('Mobile:', 20, yPosition);
    yPosition += 6;
    doc.text(`  Performance: ${psMobile.performanceScore}/100`, 25, yPosition);
    yPosition += 5;
    doc.text(`  Accessibility: ${psMobile.accessibilityScore}/100`, 25, yPosition);
    yPosition += 5;
    doc.text(`  Best Practices: ${psMobile.bestPracticesScore}/100`, 25, yPosition);
    yPosition += 5;
    doc.text(`  SEO: ${psMobile.seoScore}/100`, 25, yPosition);
    yPosition += 8;
    
    const psDesktop = analysis.technical.pagespeed.desktop;
    doc.text('Desktop:', 20, yPosition);
    yPosition += 6;
    doc.text(`  Performance: ${psDesktop.performanceScore}/100`, 25, yPosition);
    yPosition += 5;
    doc.text(`  Accessibility: ${psDesktop.accessibilityScore}/100`, 25, yPosition);
    yPosition += 5;
    doc.text(`  Best Practices: ${psDesktop.bestPracticesScore}/100`, 25, yPosition);
    yPosition += 5;
    doc.text(`  SEO: ${psDesktop.seoScore}/100`, 25, yPosition);
    yPosition += 15;
  }

  // AEO/RAO Section
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(168, 85, 247); // Purple
  doc.text('AEO/RAO - Answer Engine Optimization', 20, yPosition);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('(FIRST-MOVER: Analisi esclusiva CtrlSEOCheck)', 20, yPosition + 5);
  yPosition += 12;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Q&A Structure: ${analysis.aeo.qaStructure.present ? 'Presente' : 'Assente'} (${analysis.aeo.qaStructure.sections} sezioni)`, 20, yPosition);
  yPosition += 6;
  doc.text(`Schema Markup: ${analysis.aeo.schema.faq ? 'FAQ' : ''} ${analysis.aeo.schema.howTo ? 'HowTo' : ''} ${analysis.aeo.schema.article ? 'Article' : ''}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Contenuti Citabili: ${analysis.aeo.citability.snippetReady} paragrafi snippet-ready`, 20, yPosition);
  yPosition += 6;
  doc.text(`Ottimizzazione Semantica: Profondità ${analysis.aeo.semantic.topicDepth}, Link interni ${analysis.aeo.semantic.internalLinks}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Leggibilità: ${analysis.aeo.readability.avgSentenceLength} parole/frase, ${analysis.aeo.readability.avgParagraphLength} frasi/paragrafo`, 20, yPosition);
  yPosition += 15;

  // Recommendations
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Top Recommendations', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  analysis.recommendations.slice(0, 10).forEach((rec, index) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }

      const priorityColor = rec.priority === 'high' ? [255, 0, 0] : rec.priority === 'medium' ? [255, 165, 0] : [0, 128, 0];
      doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
    doc.circle(25, yPosition - 2, 2, 'F');

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${rec.title}`, 30, yPosition);
    yPosition += 5;

    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(rec.description, pageWidth - 40);
    doc.text(lines, 30, yPosition);
    yPosition += lines.length * 5 + 3;
  });

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} - CtrlSEOCheck by Ctrl Studio`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  doc.save(`seo-audit-${analysis.url.replace(/https?:\/\//, '').replace(/\//g, '-')}-${Date.now()}.pdf`);
}

