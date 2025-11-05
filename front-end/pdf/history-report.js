/**
 * Geração do PDF - Relatório da tela de Histórico
 */

class HistoryReportGenerator {
  constructor() {
    this.API_URL = 'http://localhost:3001/api';
  }

  /**
   * Baixa PDF de uma verificação específica do histórico via backend
   * @param {number} id - ID da verificação
   */
  async downloadPDF(id) {
    try {
      console.log(`Iniciando download de PDF para verificação ${id}`);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Mostrar toast de loading
      const loadingToast = this._showToast('Gerando PDF...', 'info');

      const response = await fetch(`${this.API_URL}/history/${id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      // Converter a resposta para blob
      const blob = await response.blob();
      
      // Criar URL temporária para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `verificacao-${id}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Remover loading e mostrar sucesso
      if (loadingToast) loadingToast.remove();
      this._showToast('PDF baixado com sucesso!', 'success');

    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      // Erro ao baixar PDF - exibe toast de erro
      this._showToast(`Erro ao gerar PDF: ${error.message}`, 'error');
    }
  }

  /**
   * Gera PDF temporário (para verificações não salvas no histórico)
   * @param {Object} verificationData - Dados da verificação
   */
  async generateTemporaryPDF(verificationData) {
    try {
      const response = await fetch(`${this.API_URL}/history/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(verificationData)
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `verificacao_temporaria_${Date.now()}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      this._showToast('PDF temporário gerado com sucesso!', 'success');

    } catch (error) {
      console.error('Erro ao gerar PDF temporário:', error);
      this._showToast(`Erro ao gerar PDF: ${error.message}`, 'error');
    }
  }

  /**
   * Gera relatório consolidado de múltiplas verificações
   * @param {Array} verificationsData - Array com dados das verificações
   */
  generateConsolidatedReport(verificationsData) {
    if (!verificationsData || verificationsData.length === 0) {
      alert('Nenhuma verificação selecionada para o relatório.');
      return;
    }
    // Utilizando a biblioteca jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurações
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 30;

    // Cabeçalho
    this._addConsolidatedHeader(doc, pageWidth, margin);
    yPosition += 20;

    // Resumo geral
    yPosition = this._addGeneralSummary(doc, verificationsData, margin, yPosition);

    // Detalhes de cada verificação
    verificationsData.forEach((verification, index) => {
      // Verificar se precisa de nova página
      if (yPosition > doc.internal.pageSize.getHeight() - 100) {
        doc.addPage();
        yPosition = 30;
      }

      yPosition = this._addVerificationDetails(doc, verification, index + 1, margin, yPosition);
    });

    // Rodapé
    this._addConsolidatedFooter(doc, pageWidth, margin);

    // Salvar
    const fileName = `relatorio_consolidado_${Date.now()}.pdf`;
    doc.save(fileName);
  }

  /**
   * Adiciona cabeçalho do relatório consolidado
   * @private
   */
  _addConsolidatedHeader(doc, pageWidth, margin) {
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO CONSOLIDADO DE VERIFICAÇÕES', margin, 15);
    
    doc.setTextColor(0, 0, 0);
  }

  /**
   * Adiciona resumo geral das verificações
   * @private
   */
  _addGeneralSummary(doc, verificationsData, margin, yPosition) {
    const totalVerifications = verificationsData.length;
    const maliciousCount = verificationsData.filter(v => v.threat_count > 0).length;
    const cleanCount = totalVerifications - maliciousCount;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO GERAL', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Verificações: ${totalVerifications}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Verificações Limpas: ${cleanCount}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Ameaças Detectadas: ${maliciousCount}`, margin, yPosition);
    yPosition += 15;

    return yPosition;
  }

  /**
   * Adiciona detalhes de uma verificação específica
   * @private
   */
  _addVerificationDetails(doc, verification, index, margin, yPosition) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index}. ${verification.type === 'url' ? 'URL' : 'Arquivo'}: ${verification.target}`, margin, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${new Date(verification.created_at).toLocaleString('pt-BR')}`, margin + 5, yPosition);
    yPosition += 7;
    doc.text(`Status: ${verification.threat_count > 0 ? 'Ameaça Detectada' : 'Seguro'}`, margin + 5, yPosition);
    yPosition += 7;
    doc.text(`Ameaças: ${verification.threat_count}`, margin + 5, yPosition);
    yPosition += 12;

    return yPosition;
  }

  /**
   * Adiciona rodapé do relatório consolidado
   * @private
   */
  _addConsolidatedFooter(doc, pageWidth, margin) {
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('Relatório consolidado gerado pelo sistema No Matters', margin, pageHeight - 25);
    doc.text(new Date().toLocaleString('pt-BR'), pageWidth - margin, pageHeight - 25, { align: 'right' });
  }

  /**
   * Exibe toast de notificação
   * @private
   */
  _showToast(message, type) {
    // Usar o sistema de toast do historyManager se disponível
    if (window.historyManager && window.historyManager.showToast) {
      return window.historyManager.showToast(message, type);
    }
    
    // Fallback para console
    console.log(`[${type.toUpperCase()}] ${message}`);
    return null;
  }
}

// Exportar a classe para uso global
window.HistoryReportGenerator = HistoryReportGenerator;