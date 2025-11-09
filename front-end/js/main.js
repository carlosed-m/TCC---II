// Aplicar tema antes do DOM carregar para evitar piscadas trocas dos temas
(function() {
  const savedTheme = localStorage.getItem('theme') || 'light-theme';
  document.documentElement.className = savedTheme;
  // Também aplicar ao body se já existir
  if (document.body) {
    document.body.className = savedTheme;
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  // === Sistema de Autenticação ===
  const API_URL = 'http://localhost:3001/api';
  
  // === Configurações do Arquivo ===
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB em bytes
  
  // === Funções Utilitárias ===
  function showFileSizeErrorModal(fileName, fileSize) {
    const modal = document.getElementById('file-size-error-modal');
    const details = document.getElementById('file-size-details');
    
    details.innerHTML = `
      <strong>Arquivo:</strong> ${fileName}<br>
      <strong>Tamanho:</strong> ${formatBytes(fileSize)}<br>
      <strong>Limite máximo:</strong> ${formatBytes(MAX_FILE_SIZE)}
    `;
    
    modal.style.display = 'flex';
  }
  // Fechar modal de erro de tamanho de arquivo
  function closeFileSizeErrorModal() {
    const modal = document.getElementById('file-size-error-modal');
    modal.style.display = 'none';
    // Limpar o input do arquivo
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.value = '';
    }
  }
  
  // Tornar função global para uso no HTML
  window.closeFileSizeErrorModal = closeFileSizeErrorModal;
  
  // Elementos de autenticação
  const loginBtn = document.getElementById('login-btn');
  const userMenu = document.getElementById('user-menu');
  const userName = document.getElementById('user-name');
  const historyBtn = document.getElementById('history-btn');
  const logoutBtn = document.getElementById('logout-btn');

  // Controle de requisições em andamento
  let currentVerificationController = null;
  let isVerificationInProgress = false;

  // Verificar se o usuário está logado
  function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      showUserMenu(JSON.parse(userData));
    } else {
      showLoginButton();
    }
  }

  // Mostrar menu do usuário logado
  function showUserMenu(user) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (userMenu) {
      userMenu.style.display = 'flex';
      if (userName) userName.textContent = `Olá, ${user.name.split(' ')[0]}`;
    }
  }

  // Mostrar botão de login
  function showLoginButton() {
    if (loginBtn) loginBtn.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
  }

  // Event listeners de autenticação
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      window.location.href = 'html/login.html';
    });
  }
  // Navegar para a parte do Histórico
  if (historyBtn) {
    historyBtn.addEventListener('click', () => {
      window.location.href = 'html/history.html';
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Cancelar qualquer verificação em andamento
      cancelCurrentVerification();
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      showLoginButton();
      
      // Mostrar modal de logout
      showLogoutModal();
    });
  }

  // Função para cancelar verificações em andamento
  function cancelCurrentVerification() {
    if (currentVerificationController && isVerificationInProgress) {
      currentVerificationController.abort();
      currentVerificationController = null;
      isVerificationInProgress = false;
      
      // Ocultar loader
      mostrarLoader(false);
      
      // Limpar resultados
      document.getElementById('results').innerHTML = '';
    }
  }

  // Função para salvar verificação no histórico (se usuário estiver logado)
  async function saveToHistory(type, target, result, status, threatCount = 0) {
    const token = localStorage.getItem('authToken');
    if (!token) return; // Se não estiver logado, não salva

    try {
      await fetch(`${API_URL}/history`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          target,
          result,
          status,
          threat_count: threatCount
        })
      });
    } catch (error) {
      console.warn('Erro ao salvar no histórico:', error);
    }
  }

  // Inicializar status de autenticação
  checkAuthStatus();

  // === Elementos Principais do DOM ===
  const themeToggleButton = document.getElementById('theme-toggle-button');
  const body = document.body;
  const tabs = document.querySelectorAll('.tab-link');
  const tabContents = document.querySelectorAll('.tab-content');
  const urlForm = document.getElementById('urlForm');
  const fileInput = document.getElementById('fileInput');

  // === Sistema de Tema ===
  // Função para aplicar o tema salvo de forma suave
  function applyTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    
    // Aplicar ao documentElement e body simultaneamente
    document.documentElement.className = savedTheme;
    body.className = savedTheme;
    // Atualizar ícone e texto do botão de tema
    if (themeToggleButton) {
      const icon = themeToggleButton.querySelector('i');
      const span = themeToggleButton.querySelector('span');
      const isDarkMode = savedTheme === 'dark-theme';
      
      if (icon) icon.className = isDarkMode ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      if (span) span.textContent = isDarkMode ? 'Tema Claro' : 'Tema Escuro';
    }
  }

  // Aplicar tema imediatamente (sem delay)
  applyTheme();

  // Configuração inicial do tema
  if (themeToggleButton) {
    // Listener do botão de tema com transição suave
    themeToggleButton.addEventListener('click', () => {
      // Determinar o novo tema
      const currentTheme = body.className;
      const newTheme = currentTheme === 'dark-theme' ? 'light-theme' : 'dark-theme';
      
      // Aplicar simultaneamente ao documentElement e body
      document.documentElement.className = newTheme;
      body.className = newTheme;
      
      const isDarkMode = newTheme === 'dark-theme';
      
      // Salvar tema no localStorage
      localStorage.setItem('theme', newTheme);
      
      // Atualizar ícone e texto
      const icon = themeToggleButton.querySelector('i');
      if (icon) icon.className = isDarkMode ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      const span = themeToggleButton.querySelector('span');
      if (span) span.textContent = isDarkMode ? 'Tema Claro' : 'Tema Escuro';
    });
  }

  // Configuração das tabs - Sistema de navegação entre Arquivo e URL
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove a classe active de todas as tabs e conteúdos
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Adiciona a classe active na tab clicada
      tab.classList.add('active');
      
      // Pega o ID do conteúdo correspondente e o ativa
      const contentId = tab.getAttribute('data-tab');
      const content = document.getElementById(contentId);
      if (content) {
        content.classList.add('active');
      } else {
        console.error('Conteúdo da tab não encontrado:', contentId);
      }
    });
  });

  // Formulário de URL
  if (urlForm) {
    urlForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const urlInput = document.getElementById('urlInput');
      const url = urlInput.value.trim();
      // Verifica se a URL inserida é válida
      if (!url) {
        exibirResultado({ erro: 'Por favor, insira uma URL válida' });
        return;
      }
      
      // Salvar URL para o relatório
      window.lastScannedUrl = url;
      window.lastScannedFile = null;
      
      // Mostrar loader
      mostrarLoader(true);
      isVerificationInProgress = true;
      currentVerificationController = new AbortController();
      // Iniciar verificação da URL
      try {
        const response = await fetch('http://localhost:3000/verificar-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
          signal: currentVerificationController.signal
        });
        // Obter dados da resposta
        const data = await response.json();
        
        if (!response.ok) {
          // Se houver erro, exibir a mensagem do servidor
          exibirResultado(data);
          return;
        }
        // Exibir resultado da verificação
        exibirResultado(data);
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }
        console.error('Erro na requisição:', error);
        exibirResultado({ erro: 'Erro ao analisar a URL', detalhe: error.message });
      } finally {
        mostrarLoader(false);
        isVerificationInProgress = false;
        currentVerificationController = null;
      }
    });
  }

  // Validação em tempo real da URL
  const urlInput = document.getElementById('urlInput');
  if (urlInput) {
    urlInput.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      // Verifica se a URL inserida é válida
      if (url.length > 0 && !validateURL(url)) {
        showURLWarning();
      } else {
        hideURLWarning();
      }
    });

    // Esconder aviso quando campo estiver vazio
    urlInput.addEventListener('blur', () => {
      const url = urlInput.value.trim();
      if (url.length === 0) {
        hideURLWarning();
      }
    });
  }

  // Input de arquivo - valida tamanho e mostra o arquivo selecionado
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const fileInfo = document.getElementById('file-info');
      const fileName = document.getElementById('file-name');
      const fileSizeWarning = document.getElementById('file-size-warning');
      
      if (file) {
        // Verificar se o arquivo excede o tamanho máximo
        if (file.size > MAX_FILE_SIZE) {
          // Mostrar modal de erro
          showFileSizeErrorModal(file.name, file.size);
          // Limpar o input
          e.target.value = '';
          // Esconder informações do arquivo
          fileInfo.style.display = 'none';
          // Mostrar aviso novamente
          if (fileSizeWarning) {
            fileSizeWarning.style.display = 'flex';
          }
          return;
        }
        
        // Arquivo válido - mostrar informações
        fileName.innerHTML = `<strong class="file-label">Arquivo selecionado:</strong> ${file.name} (${formatBytes(file.size)})`;
        fileInfo.style.display = 'block';
        
        // Esconder aviso de tamanho máximo
        if (fileSizeWarning) {
          fileSizeWarning.style.display = 'none';
        }
      } else {
        fileInfo.style.display = 'none';
        // Mostrar aviso novamente
        if (fileSizeWarning) {
          fileSizeWarning.style.display = 'flex';
        }
      }
    });
  }

  // Botão de confirmação de envio do arquivo
  const confirmUploadBtn = document.getElementById('confirmUpload');
  if (confirmUploadBtn) {
    confirmUploadBtn.addEventListener('click', async () => {
      const file = fileInput.files[0];
      if (!file) {
        exibirResultado({ erro: 'Nenhum arquivo selecionado' });
        return;
      }
      
      // Salvar arquivo para o relatório
      window.lastScannedFile = file.name;
      window.lastScannedUrl = null;
      
      // Mostrar loader de envio
      mostrarLoader(true);
      isVerificationInProgress = true;
      currentVerificationController = new AbortController();
      
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('http://localhost:3000/verificar-arquivo', {
          method: 'POST',
          body: formData,
          signal: currentVerificationController.signal
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          // Se houver erro, exibir a mensagem do servidor
          exibirResultado(data);
          return;
        }
        
        exibirResultado(data);
        
        // Limpa o arquivo selecionado após o envio
        fileInput.value = '';
        document.getElementById('file-info').style.display = 'none';
        
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }
        exibirResultado({ erro: 'Erro ao analisar o arquivo', detalhe: error.message });
      } finally {
        mostrarLoader(false);
        isVerificationInProgress = false;
        currentVerificationController = null;
      }
    });
  }

  // Funções auxiliares
  function mostrarLoader(show) {
    const loader = document.getElementById('loading');
    if (!loader) return;
    
    loader.style.display = show ? 'block' : 'none';
    
    if (show) {
      const results = document.getElementById('results');
      if (results) results.innerHTML = '';
    }
  }
  // Formatar bytes para exibição legível
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // === Validação da URL ===
  function validateURL(url) {
    const urlPattern = /^https?:\/\//i;
    return urlPattern.test(url);
  }
  // Mostrar aviso de URL inválida
  function showURLWarning() {
    const warning = document.getElementById('url-warning');
    if (warning) {
      warning.style.display = 'flex';
    }
  }
  // Esconder aviso de URL inválida
  function hideURLWarning() {
    const warning = document.getElementById('url-warning');
    if (warning) {
      warning.style.display = 'none';
    }
  }
  // Exibir resultado da verificação
  function exibirResultado(data) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    resultsDiv.innerHTML = '';
    // Verificar se houve erro na resposta
    if (data.erro) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = data.erro;
      if (data.detalhe) {
        errorDiv.textContent += '\n' + data.detalhe;
      }
      resultsDiv.appendChild(errorDiv);
      return;
    }
    //  Verificar se os atributos existem
    if (!data.data?.attributes) {
      resultsDiv.innerHTML = '<div class="error-message">Resposta inválida da API</div>';
      return;
    }
    // Processar e exibir os resultados
    const attributes = data.data.attributes;
    const stats = attributes.last_analysis_stats || attributes.stats;
    const isMalicious = stats && stats.malicious > 0;

    // Botão de resultado
    const resultButton = document.createElement('button');
    resultButton.id = 'threatResult';
    resultButton.innerHTML = isMalicious ? 'Ameaça detectada!' : 'Nenhuma ameaça encontrada!';
    resultButton.className = isMalicious ? 'threat-detected' : 'no-threat';

    // Card de dicas de segurança
    const tipsCard = document.createElement('div');
    tipsCard.className = `security-tips-card ${isMalicious ? 'malicious' : 'safe'}`;
    
    // Seleciona a dica apropriada
    const tip = isMalicious 
      ? window.securityTips?.threats?.malware?.[
          Math.floor(Math.random() * window.securityTips.threats.malware.length)
        ] 
      : window.securityTips?.safe?.[
          Math.floor(Math.random() * window.securityTips.safe.length)
        ];
    // Adiciona a dica ao card
    if (tip) {
      tipsCard.innerHTML = `
        <h3>${isMalicious ? '🚨 Dica de Segurança' : 'Lembre-se Sempre'}</h3>
        <p>${tip}</p>
      `;
    }

    // Card de detalhes técnicos
    const detailsCard = document.createElement('div');
    detailsCard.className = 'details-card';
    detailsCard.style.display = 'none';

    // Calcular total de antivírus
    const totalAntivirus = (stats.harmless || 0) + (stats.malicious || 0) + (stats.suspicious || 0) + (stats.undetected || 0) + (stats.timeout || 0);
    
    // Estatísticas
    const statsHtml = `
      <div class="stats-container">
        <div class="stat-item">
          <h4>Resultados da Análise</h4>
          <div class="total-antivirus-info">
            <i class="fa-solid fa-shield-virus"></i>
            <span><strong>${totalAntivirus} antivírus</strong> foram utilizados nesta verificação</span>
          </div>
          <p class="antivirus-explanation">Os números abaixo representam quantos antivírus classificaram o conteúdo em cada categoria:</p>
          <div class="stat-grid">
            <div class="stat-box harmless">
              <span class="stat-number">${stats.harmless || 0}</span>
              <span class="stat-label">Seguro</span>
            </div>
            <div class="stat-box malicious">
              <span class="stat-number">${stats.malicious || 0}</span>
              <span class="stat-label">Malicioso</span>
            </div>
            <div class="stat-box suspicious">
              <span class="stat-number">${stats.suspicious || 0}</span>
              <span class="stat-label">Suspeito</span>
            </div>
            <div class="stat-box undetected">
              <span class="stat-number">${stats.undetected || 0}</span>
              <span class="stat-label">Não detectado</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Resultados dos antivírus
    let antivirusResults = '';
    if (attributes.last_analysis_results) {
      const results = attributes.last_analysis_results;
      // Filtra primeiro para encontrar resultados maliciosos
      const maliciousResults = Object.entries(results)
        .filter(([_, result]) => result.category === 'malicious' || result.result)
        .slice(0, 3);

      // Adiciona descrição das detecções no topo se houver ameaças
      const detectionDescription = maliciousResults.length > 0 
        ? `<div class="detection-summary">
            <h4>Resumo da Análise</h4>
            <div class="detection-description">
              <p>Foram encontradas ${maliciousResults.length} detecções significativas:</p>
              <ul>
                ${maliciousResults.map(([av, result]) => `
                  <li>
                    <strong>${av}</strong> identificou: ${result.result || 'Ameaça'}
                    ${result.description ? `<br><small>${result.description}</small>` : ''}
                  </li>
                `).join('')}
              </ul>
              <p class="detection-note">Esta análise indica potenciais riscos de segurança.</p>
            </div>
          </div>` 
        : '';

      antivirusResults = `
        <div class="antivirus-results">
          ${detectionDescription}
          <h4>Resultados por Antivírus</h4>
          <div class="av-grid">
            ${Object.entries(results)
              .slice(0, 10)
              .map(([av, result]) => `
                <div class="av-item ${result.category}">
                  <strong>${av}</strong>
                  <span class="av-result">${result.result || 'Limpo'}</span>
                  ${result.description ? `
                    <div class="av-description">
                      <small>${result.description}</small>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
          </div>
          <p class="av-note">Mostrando 10 dos ${Object.keys(results).length} antivírus</p>
        </div>
      `;
    }

    // Informações adicionais
    const additionalInfo = `
      <div class="additional-info">
        <h4>Informações Adicionais</h4>
        <ul>
          ${attributes.type ? `<li><strong>Tipo:</strong> ${attributes.type}</li>` : ''}
          ${attributes.size ? `<li><strong>Tamanho:</strong> ${formatBytes(attributes.size)}</li>` : ''}
          ${attributes.first_submission_date ? 
            `<li><strong>Primeira Análise:</strong> ${new Date(attributes.first_submission_date * 1000).toLocaleDateString()}</li>` : ''}
          ${attributes.last_analysis_date ? 
            `<li><strong>Última Análise:</strong> ${new Date(attributes.last_analysis_date * 1000).toLocaleDateString()}</li>` : ''}
          <li><strong>Status:</strong> ${stats.harmless > 0 ? 'Verificado e Seguro' : 'Não verificado'}</li>
          ${attributes.reputation ? `<li><strong>Reputação:</strong> ${attributes.reputation}</li>` : ''}
          <li>
            <strong>Resumo da Verificação:</strong>
            <ul class="verification-summary">
              <li class="no-bullet"><strong>Seguros:</strong> ${stats.harmless || 0} antivírus não encontraram ameaças</li>
              <li class="no-bullet"><strong>Não detectados:</strong> ${stats.undetected || 0} antivírus não detectaram problemas</li>
              ${stats.suspicious > 0 ? `<li class="no-bullet">Suspeitos: ${stats.suspicious} antivírus marcaram como suspeito</li>` : ''}
              ${stats.malicious > 0 ? `<li class="malicious no-bullet">Maliciosos: ${stats.malicious} antivírus detectaram ameaças</li>` : ''}
            </ul>
          </li>
          ${attributes.categories ? `
          <li>
            <strong>Categorias:</strong>
            <ul class="categories-list">
              ${Object.entries(attributes.categories)
                .map(([engine, category]) => `<li>${engine}: ${category}</li>`)
                .join('')}
            </ul>
          </li>` : ''}
          ${(() => {
            if (attributes.last_analysis_results) {
              const maliciousResults = Object.entries(attributes.last_analysis_results)
                .filter(([_, result]) => result.category === 'malicious' || result.result)
                .slice(0, 3); // Pegamos até 3 detecções para não sobrecarregar a visualização
              
              if (maliciousResults.length > 0) {
                return `
                  <li class="detection-details">
                    <strong>Detecções Encontradas:</strong>
                    <ul class="detection-list">
                      ${maliciousResults.map(([av, result]) => `
                        <li>
                          <span class="av-name">${av}:</span> 
                          <span class="detection-type">${result.result || 'Malicioso'}</span>
                          ${result.method ? `<br><small>Método: ${result.method}</small>` : ''}
                          ${result.engine_name ? `<br><small>Engine: ${result.engine_name}</small>` : ''}
                          ${result.category ? `<br><small>Categoria: ${result.category}</small>` : ''}
                        </li>
                      `).join('')}
                    </ul>
                  </li>
                `;
              }
            }
            return '';
          })()}
        </ul>
      </div>
    `;

    // Monta o card de detalhes
    detailsCard.innerHTML = `
      ${statsHtml}
      ${antivirusResults}
      ${additionalInfo}
    `;

    // Botão para mostrar/ocultar detalhes
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Mostrar detalhes técnicos';
    toggleButton.className = 'toggle-details';
    toggleButton.onclick = () => {
      const isHidden = detailsCard.style.display === 'none';
      detailsCard.style.display = isHidden ? 'block' : 'none';
      toggleButton.textContent = isHidden ? 'Ocultar detalhes técnicos' : 'Mostrar detalhes técnicos';
    };

    // Armazena os dados para o relatório
    window.lastAnalysisData = {
      data: data,
      analysisType: document.querySelector('.tab-link.active').textContent.trim(),
      timestamp: new Date(),
      isMalicious: isMalicious,
      stats: stats,
      tip: tip,
      // Adicionar URL/arquivo original
      originalUrl: window.lastScannedUrl || null,
      originalFile: window.lastScannedFile || null
    };

    // Botão para gerar relatório PDF
    const generateReportBtn = document.createElement('button');
    generateReportBtn.className = 'generate-report-btn';
    generateReportBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Gerar Relatório PDF';
    generateReportBtn.onclick = () => {
      const reportGenerator = new ScannerReportGenerator();
      reportGenerator.generatePDFReport(window.lastAnalysisData);
    };

    // Botão Nova Análise
    const newAnalysisButton = document.createElement('button');
    newAnalysisButton.textContent = 'Nova Análise';
    newAnalysisButton.className = 'new-analysis-btn';
    newAnalysisButton.onclick = () => {
      // Limpa os resultados
      resultsDiv.innerHTML = '';
      
      // Limpa o input de arquivo se houver
      const fileInput = document.getElementById('fileInput');
      const fileInfo = document.getElementById('file-info');
      if (fileInput) {
        fileInput.value = '';
      }
      if (fileInfo) {
        fileInfo.style.display = 'none';
      }
      
      // Limpa o input de URL se houver
      const urlInput = document.getElementById('urlInput');
      if (urlInput) {
        urlInput.value = '';
      }
      
      // Volta o foco para a aba ativa
      const activeTab = document.querySelector('.tab-link.active');
      if (activeTab) {
        const tabId = activeTab.dataset.tab;
        if (tabId === 'file-tab') {
          // Se estiver na aba de arquivo, foca no botão de escolher arquivo
          const chooseFileLabel = document.querySelector('.custom-file-upload');
          if (chooseFileLabel) chooseFileLabel.focus();
        } else if (tabId === 'url-tab') {
          // Se estiver na aba de URL, foca no input de URL
          if (urlInput) urlInput.focus();
        }
      }
    };

    // Salvar no histórico se usuário estiver logado
    saveVerificationToHistory(data, isMalicious, stats);

    resultsDiv.appendChild(resultButton);
    resultsDiv.appendChild(tipsCard);
    resultsDiv.appendChild(toggleButton);
    resultsDiv.appendChild(detailsCard);
    resultsDiv.appendChild(generateReportBtn);
    resultsDiv.appendChild(newAnalysisButton);
  }

  // Função para salvar verificação no histórico
  async function saveVerificationToHistory(data, isMalicious, stats) {
    const token = localStorage.getItem('authToken');
    if (!token) return; // Só salva se estiver logado

    try {
      const activeTab = document.querySelector('.tab-link.active');
      const isUrl = activeTab?.dataset.tab === 'url-tab';
      const target = isUrl ? 
        document.getElementById('urlInput')?.value : 
        document.getElementById('fileInput')?.files[0]?.name || 'Arquivo';

      const threatCount = stats?.malicious || 0;
      let status = 'clean';
      if (threatCount > 0 && threatCount <= 3) status = 'suspicious';
      else if (threatCount > 3) status = 'malicious';

      await saveToHistory(
        isUrl ? 'url' : 'file',
        target,
        data,
        status,
        threatCount
      );
    } catch (error) {
      console.warn('Erro ao salvar no histórico:', error);
    }
  }
});

// === Funções do Modal de Logout ===

// Mostrar modal de logout
function showLogoutModal() {
  const modal = document.getElementById('logout-modal');
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevenir scroll da página
    
    // Focar no botão OK para acessibilidade
    setTimeout(() => {
      const okButton = document.getElementById('close-logout-modal');
      if (okButton) {
        okButton.focus();
      }
    }, 300);
  }
}

// Fechar modal de logout
function closeLogoutModal() {
  const modal = document.getElementById('logout-modal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Restaurar scroll da página
  }
}

// === Funções do Modal de Ajuda ===

// Abrir modal de ajuda
function openHelpModal() {
  const modal = document.getElementById('help-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevenir scroll da página
  }
}

// Fechar modal de ajuda
function closeHelpModal() {
  const modal = document.getElementById('help-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restaurar scroll da página
  }
}

// Tornar funções globais para uso no HTML
window.openHelpModal = openHelpModal;
window.closeHelpModal = closeHelpModal;

// Event listeners para o modal de logout
document.addEventListener('DOMContentLoaded', () => {
  const closeLogoutModalBtn = document.getElementById('close-logout-modal');
  const logoutModal = document.getElementById('logout-modal');
  const helpModal = document.getElementById('help-modal');
  
  // Fechar modal ao clicar no botão OK
  if (closeLogoutModalBtn) {
    closeLogoutModalBtn.addEventListener('click', closeLogoutModal);
  }
  
  // Fechar modal ao clicar fora dele
  if (logoutModal) {
    logoutModal.addEventListener('click', (e) => {
      if (e.target === logoutModal) {
        closeLogoutModal();
      }
    });
  }
  
  // Fechar modal de ajuda ao clicar fora
  if (helpModal) {
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) {
        closeHelpModal();
      }
    });
  }
  
  // Fechar modal ao pressionar ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (logoutModal && logoutModal.style.display === 'flex') {
        closeLogoutModal();
      }
      if (helpModal && helpModal.style.display === 'flex') {
        closeHelpModal();
      }
    }
  });
});