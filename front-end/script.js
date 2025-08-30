document.addEventListener('DOMContentLoaded', () => {
  // Elementos do DOM
  const themeToggleButton = document.getElementById('theme-toggle-button');
  const body = document.body;
  const tabs = document.querySelectorAll('.tab-link');
  const tabContents = document.querySelectorAll('.tab-content');
  const urlForm = document.getElementById('urlForm');
  const fileInput = document.getElementById('fileInput');

  // Configuração inicial do tema
  if (themeToggleButton) {
    const icon = themeToggleButton.querySelector('i');
    const span = themeToggleButton.querySelector('span');
    if (icon) icon.className = 'fa-solid fa-moon';
    if (span) span.textContent = 'Mudar para Tema Escuro';

    // Listener do botão de tema
    themeToggleButton.addEventListener('click', () => {
      body.classList.toggle('dark-theme');
      body.classList.toggle('light-theme');
      const isDarkMode = body.classList.contains('dark-theme');
      const icon = themeToggleButton.querySelector('i');
      if (icon) icon.className = isDarkMode ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      const span = themeToggleButton.querySelector('span');
      if (span) span.textContent = isDarkMode ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro';
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

      if (!url) {
        exibirResultado({ erro: 'Por favor, insira uma URL válida' });
        return;
      }

      mostrarLoader(true);

      try {
        const response = await fetch('/verificar-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(JSON.stringify(data || { status: response.status }));
        }
        
        exibirResultado(data);
      } catch (error) {
        console.error('Erro na requisição:', error);
        exibirResultado({ erro: 'Erro ao analisar a URL', detalhe: error.message });
      } finally {
        mostrarLoader(false);
      }
    });
  }

  // Input de arquivo
  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      mostrarLoader(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/verificar-arquivo', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(JSON.stringify(data || { status: response.status }));
        }
        
        exibirResultado(data);
      } catch (error) {
        exibirResultado({ erro: 'Erro ao analisar o arquivo', detalhe: error.message });
      } finally {
        mostrarLoader(false);
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

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function exibirResultado(data) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    resultsDiv.innerHTML = '';

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

    if (!data.data?.attributes) {
      resultsDiv.innerHTML = '<div class="error-message">Resposta inválida da API</div>';
      return;
    }

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
    tipsCard.className = 'security-tips-card';
    
    // Seleciona a dica apropriada
    const tip = isMalicious 
      ? window.securityTips?.threats?.malware?.[
          Math.floor(Math.random() * window.securityTips.threats.malware.length)
        ] 
      : window.securityTips?.safe?.[
          Math.floor(Math.random() * window.securityTips.safe.length)
        ];

    if (tip) {
      tipsCard.innerHTML = `
        <h3>${isMalicious ? '🚨 Dica de Segurança' : '💡 Lembre-se'}</h3>
        <p>${tip}</p>
      `;
    }

    // Card de detalhes técnicos
    const detailsCard = document.createElement('div');
    detailsCard.className = 'details-card';
    detailsCard.style.display = 'none';

    // Estatísticas
    const statsHtml = `
      <div class="stats-container">
        <div class="stat-item">
          <h4>Resultados da Análise</h4>
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
              ${stats.suspicious > 0 ? `<li>Suspeitos: ${stats.suspicious} antivírus marcaram como suspeito</li>` : ''}
              ${stats.malicious > 0 ? `<li class="malicious">Maliciosos: ${stats.malicious} antivírus detectaram ameaças</li>` : ''}
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

    // Adiciona todos os elementos ao DOM
    resultsDiv.appendChild(resultButton);
    resultsDiv.appendChild(tipsCard);
    resultsDiv.appendChild(toggleButton);
    resultsDiv.appendChild(detailsCard);
  }
});
