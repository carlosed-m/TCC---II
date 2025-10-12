/**
 * GERADOR DE PDF - RELATÓRIO DE VERIFICAÇÃO DA TELA INICIAL */

class ScannerReportGenerator {
  constructor() {
    this.pageWidth = null;
    this.margin = 20;
    this.yPosition = 30;
  }

  /**
   * Gera um relatório PDF baseado nos dados de análise da tela inicial
   * @param {Object} analysisData - Dados da análise realizada
   */
  generatePDFReport(analysisData) {
    if (!analysisData) {
      alert('Dados de análise não encontrados. Realize uma verificação primeiro.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    this.pageWidth = doc.internal.pageSize.getWidth();
    this.yPosition = 30;

    // Gerar todas as seções do relatório
    this._addHeader(doc);
    this._addGeneralInfo(doc, analysisData);
    this._addAnalysisResult(doc, analysisData);
    this._addStatistics(doc, analysisData);
    this._addSecurityTip(doc, analysisData);
    this._addFooter(doc);

    // Salvar o PDF
    const fileName = `relatorio_seguranca_${Date.now()}.pdf`;
    doc.save(fileName);
  }

  /**
   * Adiciona o cabeçalho azul do relatório
   * @private
   */
  _addHeader(doc) {
    // Cabeçalho azul
    doc.setFillColor(59, 130, 246); // #3B82F6
    doc.rect(0, 0, this.pageWidth, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE VERIFICAÇÃO DE SEGURANÇA', this.margin, 15);
    
    // Reset cor do texto
    doc.setTextColor(0, 0, 0);
    this.yPosition += 10;
  }

  /**
   * Adiciona informações gerais da verificação
   * @private
   */
  _addGeneralInfo(doc, analysisData) {
    this.yPosition = this._addText(doc, 'INFORMAÇÕES GERAIS', this.margin, this.yPosition, { fontSize: 14, bold: true });
    this.yPosition = this._addText(doc, `Data/Hora: ${analysisData.timestamp.toLocaleString('pt-BR')}`, this.margin, this.yPosition);
    this.yPosition = this._addText(doc, `Tipo de Análise: ${analysisData.analysisType}`, this.margin, this.yPosition);
    
    // URL ou arquivo analisado
    const attributes = analysisData.data.data.attributes;
    if (attributes.url) {
      this.yPosition = this._addText(doc, `URL Analisada: ${attributes.url}`, this.margin, this.yPosition);
    } else if (attributes.meaningful_name) {
      this.yPosition = this._addText(doc, `Arquivo Analisado: ${attributes.meaningful_name}`, this.margin, this.yPosition);
    }
    
    // Status da verificação
    const status = analysisData.isMalicious ? 'malicious' : 'clean';
    this.yPosition = this._addText(doc, `Status da Verificação: ${this._translateStatus(status)}`, this.margin, this.yPosition);
    
    this.yPosition += 10;
  }

  /**
   * Adiciona o resultado da análise com caixa colorida
   * @private
   */
  _addAnalysisResult(doc, analysisData) {
    const resultColor = analysisData.isMalicious ? [239, 68, 68] : [34, 197, 94];
    const resultText = analysisData.isMalicious ? 'AMEAÇA DETECTADA' : 'NENHUMA AMEAÇA ENCONTRADA';
    
    doc.setFillColor(...resultColor);
    doc.rect(this.margin, this.yPosition - 8, this.pageWidth - 2 * this.margin, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    this.yPosition = this._addText(doc, resultText, this.margin + 5, this.yPosition, { fontSize: 14, bold: true });
    
    doc.setTextColor(0, 0, 0);
    this.yPosition += 25;
  }

  /**
   * Adiciona estatísticas da análise
   * @private
   */
  _addStatistics(doc, analysisData) {
    this.yPosition = this._addText(doc, 'ESTATÍSTICAS DA ANÁLISE', this.margin, this.yPosition, { fontSize: 14, bold: true });
    
    const stats = analysisData.stats;
    this.yPosition = this._addText(doc, `- Seguros: ${stats.harmless || 0} antivírus`, this.margin + 5, this.yPosition);
    this.yPosition = this._addText(doc, `- Maliciosos: ${stats.malicious || 0} antivírus`, this.margin + 5, this.yPosition);
    this.yPosition = this._addText(doc, `- Suspeitos: ${stats.suspicious || 0} antivírus`, this.margin + 5, this.yPosition);
    this.yPosition = this._addText(doc, `- Não detectados: ${stats.undetected || 0} antivírus`, this.margin + 5, this.yPosition);
    
    this.yPosition += 10;
  }

  /**
   * Adiciona dica de segurança
   * @private
   */
  _addSecurityTip(doc, analysisData) {
    this.yPosition = this._addText(doc, 'DICA DE SEGURANÇA', this.margin, this.yPosition, { fontSize: 14, bold: true });
    const securityTip = analysisData.isMalicious 
      ? 'Ameaça detectada! Evite interagir com este conteúdo e mantenha seu antivírus atualizado.'
      : 'Conteúdo considerado seguro. Continue mantendo boas práticas de segurança digital.';
    this.yPosition = this._addText(doc, securityTip, this.margin + 5, this.yPosition);
    
    this.yPosition += 10;
  }

  /**
   * Adiciona rodapé do relatório
   * @private
   */
  _addFooter(doc) {
    // Verificar se precisa de nova página
    if (this.yPosition > doc.internal.pageSize.getHeight() - 50) {
      doc.addPage();
      this.yPosition = 30;
    }
    
    // Rodapé (sempre na parte inferior da página)
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('Relatório gerado automaticamente pelo sistema No Matters', this.margin, pageHeight - 25, { align: 'left' });
    doc.text(`Página 1 de 1 - ${new Date().toLocaleString('pt-BR')}`, this.pageWidth - this.margin, pageHeight - 25, { align: 'right' });
  }

  /**
   * Função auxiliar para adicionar texto com quebra de linha
   * @private
   */
  _addText(doc, text, x, y, options = {}) {
    const maxWidth = options.maxWidth || (this.pageWidth - 2 * this.margin);
    const fontSize = options.fontSize || 12;
    const isBold = options.bold || false;
    
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    // Dividir texto em linhas se necessário
    const lines = doc.splitTextToSize(text, maxWidth);
    const lineHeight = fontSize * 0.35;
    
    lines.forEach((line, index) => {
      doc.text(line, x, y + (index * lineHeight));
    });
    
    return y + (lines.length * lineHeight) + 5;
  }

  /**
   * Traduz status para português
   * @private
   */
  _translateStatus(status) {
    const statusMap = {
      'clean': 'Limpo',
      'malicious': 'Malicioso', 
      'suspicious': 'Suspeito',
      'undetected': 'Não Detectado',
      'timeout': 'Timeout',
      'harmless': 'Inofensivo'
    };
    return statusMap[status] || status;
  }
}

// Exportar a classe para uso global
window.ScannerReportGenerator = ScannerReportGenerator;