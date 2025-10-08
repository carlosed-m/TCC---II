// Configuração da API
const API_URL = 'http://localhost:3001/api';

class HistoryManager {
  constructor() {
    // Elementos do DOM
    this.userMenu = document.getElementById('user-menu');
    this.userName = document.getElementById('user-name');
    this.logoutBtn = document.getElementById('logout-btn');
    this.themeToggleButton = document.getElementById('theme-toggle-button');
    this.loading = document.getElementById('loading');
    this.historyList = document.getElementById('history-list');
    this.emptyState = document.getElementById('empty-state');
    this.pagination = document.getElementById('pagination');

    // Filtros
    this.typeFilter = document.getElementById('type-filter');
    this.statusFilter = document.getElementById('status-filter');
    this.searchInput = document.getElementById('search-input');

    // Estatísticas
    this.totalScans = document.getElementById('total-scans');
    this.totalUrls = document.getElementById('total-urls');
    this.totalFiles = document.getElementById('total-files');
    this.cleanScans = document.getElementById('clean-scans');
    this.threatScans = document.getElementById('threat-scans');

    // Estado atual
    this.currentPage = 1;
    this.currentFilters = {};
    this.allHistory = [];

    this.init();
  }

  init() {
    // Verificar autenticação
    if (!this.checkAuth()) {
      return;
    }

    // Configurar tema
    this.setupTheme();

    // Event listeners
    this.setupEventListeners();

    // Carregar dados
    this.loadStats();
    this.loadHistory();
  }

  checkAuth() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (!token || !userData) {
      window.location.href = 'login.html';
      return false;
    }

    const user = JSON.parse(userData);
    this.userName.textContent = `Olá, ${user.name.split(' ')[0]}`;
    return true;
  }

  setupTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light-theme';
    document.body.className = currentTheme;
    
    // Aplicar o ícone e texto corretos ao carregar
    const isDarkMode = currentTheme === 'dark-theme';
    const icon = this.themeToggleButton.querySelector('i');
    const span = this.themeToggleButton.querySelector('span');
    
    if (icon) icon.className = isDarkMode ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    if (span) span.textContent = isDarkMode ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro';

    this.themeToggleButton.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      document.body.classList.toggle('light-theme');
      const isDarkMode = document.body.classList.contains('dark-theme');
      const icon = this.themeToggleButton.querySelector('i');
      if (icon) icon.className = isDarkMode ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      const span = this.themeToggleButton.querySelector('span');
      if (span) span.textContent = isDarkMode ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro';
      
      localStorage.setItem('theme', document.body.className);
    });
  }

  setupEventListeners() {
    // Logout
    this.logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = 'index.html';
    });

    // Filtros
    this.typeFilter.addEventListener('change', this.applyFilters.bind(this));
    this.statusFilter.addEventListener('change', this.applyFilters.bind(this));
    this.searchInput.addEventListener('input', this.debounce(this.applyFilters.bind(this), 300));
  }

  async loadStats() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/history/stats/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const stats = data.data;

        this.totalScans.textContent = stats.total_scans || 0;
        this.totalUrls.textContent = stats.total_urls || 0;
        this.totalFiles.textContent = stats.total_files || 0;
        this.cleanScans.textContent = stats.clean_scans || 0;
        this.threatScans.textContent = stats.threat_scans || 0;
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }

  async loadHistory(page = 1, filters = {}) {
    this.loading.style.display = 'block';
    this.historyList.style.display = 'none';
    this.emptyState.style.display = 'none';
    this.pagination.style.display = 'none';

    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      });

      const response = await fetch(`${API_URL}/history?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.displayHistory(data.data);
        this.displayPagination(data.pagination);
        this.allHistory = data.data;
      } else {
        throw new Error('Erro ao carregar histórico');
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      this.emptyState.style.display = 'block';
    } finally {
      this.loading.style.display = 'none';
    }
  }

  displayHistory(history) {
    if (history.length === 0) {
      this.emptyState.style.display = 'block';
      return;
    }

    this.historyList.innerHTML = history.map(item => this.createHistoryItem(item)).join('');
    this.historyList.style.display = 'block';
  }

  createHistoryItem(item) {
    const date = new Date(item.created_at).toLocaleString('pt-BR');
    const statusClass = this.getStatusClass(item.status, item.threat_count);
    const statusText = this.getStatusText(item.status, item.threat_count);
    const typeIcon = item.type === 'url' ? 'fa-link' : 'fa-file';

    return `
      <div class="history-item">
        <div class="item-header">
          <div class="item-info">
            <div class="item-type type-${item.type}">
              <i class="fa-solid ${typeIcon}"></i>
              ${item.type.toUpperCase()}
            </div>
            <div class="item-target">${item.target}</div>
            <div class="item-date">
              <i class="fa-solid fa-clock"></i>
              ${date}
            </div>
          </div>
          <div class="item-actions">
            <button class="action-btn pdf-btn" onclick="historyManager.downloadPDF(${item.id})">
              <i class="fa-solid fa-file-pdf"></i>
              PDF
            </button>
            <button class="action-btn delete-btn" onclick="historyManager.deleteItem(${item.id})">
              <i class="fa-solid fa-trash"></i>
              Excluir
            </button>
          </div>
        </div>
        <div class="item-status">
          <div class="status-badge ${statusClass}">
            ${statusText}
          </div>
          ${item.threat_count > 0 ? `<span class="threat-count">${item.threat_count} ameaça(s) detectada(s)</span>` : ''}
        </div>
      </div>
    `;
  }

  getStatusClass(status, threatCount) {
    if (threatCount === 0) return 'status-clean';
    if (threatCount > 0 && threatCount <= 3) return 'status-suspicious';
    return 'status-malicious';
  }

  getStatusText(status, threatCount) {
    if (threatCount === 0) return '<i class="fa-solid fa-shield-check"></i> Limpo';
    if (threatCount > 0 && threatCount <= 3) return '<i class="fa-solid fa-exclamation-triangle"></i> Suspeito';
    return '<i class="fa-solid fa-skull-crossbones"></i> Malicioso';
  }

  displayPagination(paginationData) {
    if (paginationData.total_pages <= 1) return;

    const { current_page, total_pages } = paginationData;
    let paginationHTML = '';

    // Botão anterior
    paginationHTML += `
      <button class="page-btn" onclick="historyManager.loadHistory(${current_page - 1}, historyManager.currentFilters)" ${current_page === 1 ? 'disabled' : ''}>
        <i class="fa-solid fa-chevron-left"></i>
      </button>
    `;

    // Páginas
    for (let i = 1; i <= total_pages; i++) {
      if (i === 1 || i === total_pages || (i >= current_page - 1 && i <= current_page + 1)) {
        paginationHTML += `
          <button class="page-btn ${i === current_page ? 'active' : ''}" onclick="historyManager.loadHistory(${i}, historyManager.currentFilters)">
            ${i}
          </button>
        `;
      } else if (i === current_page - 2 || i === current_page + 2) {
        paginationHTML += `<span>...</span>`;
      }
    }

    // Botão próximo
    paginationHTML += `
      <button class="page-btn" onclick="historyManager.loadHistory(${current_page + 1}, historyManager.currentFilters)" ${current_page === total_pages ? 'disabled' : ''}>
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    `;

    this.pagination.innerHTML = paginationHTML;
    this.pagination.style.display = 'flex';
  }

  async downloadPDF(id) {
    try {
      console.log('📄 Iniciando download de PDF para ID:', id);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Mostrar loading
      const loadingToast = this.showToast('Gerando PDF...', 'info');

      const response = await fetch(`${API_URL}/history/${id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      // Converter resposta para blob
      const blob = await response.blob();
      
      // Criar link de download
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
      this.showToast('PDF baixado com sucesso!', 'success');
      
    } catch (error) {
      console.error('❌ Erro ao baixar PDF:', error);
      this.showToast(`Erro ao gerar PDF: ${error.message}`, 'error');
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-size: 14px;
      max-width: 300px;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Auto remove após 3 segundos
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 3000);
    
    return toast;
  }

  // Função createDetailsModalContent removida - agora usamos PDF

  showDeleteConfirmation(id) {
    // Encontrar a verificação nos dados atuais
    const verification = this.allHistory.find(item => item.id === id);
    if (!verification) return;

    // Atualizar informações no modal
    const infoElement = document.getElementById('delete-verification-info');
    const date = new Date(verification.created_at).toLocaleString('pt-BR');
    const statusText = this.getStatusText(verification.status, verification.threat_count);
    
    infoElement.innerHTML = `
      <div style="text-align: left;">
        <strong>Tipo:</strong> ${verification.type === 'url' ? 'URL' : 'Arquivo'}<br>
        <strong>Alvo:</strong> ${verification.target}<br>
        <strong>Status:</strong> ${statusText.replace(/<[^>]*>/g, '')}<br>
        <strong>Data:</strong> ${date}
      </div>
    `;

    // Mostrar modal
    const modal = document.getElementById('delete-confirmation-modal');
    modal.style.display = 'block';

    // Configurar botão de confirmação
    const confirmBtn = document.getElementById('confirm-delete-btn');
    confirmBtn.onclick = () => this.confirmDelete(id);
  }

  async confirmDelete(id) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.closeDeleteModal();
        this.showToast('Verificação excluída com sucesso', 'success');
        this.loadHistory(this.currentPage, this.currentFilters);
        this.loadStats();
      } else {
        throw new Error('Erro ao excluir');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      this.showToast('Erro ao excluir a verificação', 'error');
    }
  }

  closeDeleteModal() {
    const modal = document.getElementById('delete-confirmation-modal');
    modal.style.display = 'none';
  }

  // Manter função deleteItem para compatibilidade, mas redirecionando para o modal
  async deleteItem(id) {
    this.showDeleteConfirmation(id);
  }

  applyFilters() {
    this.currentFilters = {};
    
    if (this.typeFilter.value) this.currentFilters.type = this.typeFilter.value;
    if (this.statusFilter.value) this.currentFilters.status = this.statusFilter.value;
    if (this.searchInput.value) this.currentFilters.search = this.searchInput.value;

    this.currentPage = 1;
    this.loadHistory(1, this.currentFilters);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Funções globais para fechar os modais
function closeDetailsModal() {
  const modal = document.getElementById('details-modal');
  modal.style.display = 'none';
}

function closeDeleteModal() {
  const modal = document.getElementById('delete-confirmation-modal');
  modal.style.display = 'none';
}

// Fechar modais ao clicar fora deles
window.addEventListener('click', (event) => {
  const detailsModal = document.getElementById('details-modal');
  const deleteModal = document.getElementById('delete-confirmation-modal');
  
  if (event.target === detailsModal) {
    closeDetailsModal();
  }
  
  if (event.target === deleteModal) {
    closeDeleteModal();
  }
});

// Fechar modais com tecla ESC
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const detailsModal = document.getElementById('details-modal');
    const deleteModal = document.getElementById('delete-confirmation-modal');
    
    if (detailsModal.style.display === 'block') {
      closeDetailsModal();
    }
    
    if (deleteModal.style.display === 'block') {
      closeDeleteModal();
    }
  }
});

// Inicializar quando o DOM estiver pronto
let historyManager;
document.addEventListener('DOMContentLoaded', () => {
  historyManager = new HistoryManager();
});