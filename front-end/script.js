document.addEventListener('DOMContentLoaded', () => {
  const themeToggleButton = document.getElementById('theme-toggle-button');
  const body = document.body;


   // --- Seleção do Tema Escuro ou Claro ---
  if (themeToggleButton) {
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

  const tabs = document.querySelectorAll('.tab-link');
  const tabContents = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(item => item.classList.remove('active'));
      tabContents.forEach(item => item.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  // --- Verificação da URL ---
  const urlForm = document.getElementById('urlForm');
  if (urlForm) {
    urlForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = document.getElementById('urlInput').value.trim();

      if (!url) {
        exibirResultado({ erro: 'Por favor, insira uma URL válida' });
        return;
      }

      mostrarLoader(true);
      try {
        const res = await fetch('/verificar-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        let payload = null;
        try { payload = await res.json(); } catch {}
        if (!res.ok) {
          throw new Error(JSON.stringify(payload || { status: res.status, statusText: res.statusText }));
        }
        exibirResultado(payload);
      } catch (error) {
        exibirResultado({ erro: 'Erro na requisição URL', detalhe: error.message });
      } finally {
        mostrarLoader(false);
      }
    });
  }

  // --- Verificação do Arquivo ---
  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      mostrarLoader(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/verificar-arquivo', {
          method: 'POST',
          body: formData
        });
        let payload = null;
        try { payload = await res.json(); } catch {}
        if (!res.ok) {
          throw new Error(JSON.stringify(payload || { status: res.status, statusText: res.statusText }));
        }
        exibirResultado(payload);
      } catch (error) {
        exibirResultado({ erro: 'Erro na requisição de arquivo', detalhe: error.message });
      } finally {
        mostrarLoader(false);
      }
    });
  }

  function mostrarLoader(show) {
    const load = document.getElementById('loading');
    if (!load) return;
    load.style.display = show ? 'block' : 'none';
    if (show) {
      const results = document.getElementById('results');
      if (results) results.innerHTML = '';
    }
  }

  function exibirResultado(data) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    resultsDiv.innerHTML = '';

    if (data?.data?.attributes) {
      const attributes = data.data.attributes;
      const stats = attributes.last_analysis_stats || attributes.stats;
      const isMalicious = stats && stats.malicious > 0;

      const resultButton = document.createElement('button');
      resultButton.id = 'threatResult';
      resultButton.innerHTML = isMalicious ? 'Ameaça detectada!' : 'Nenhuma ameaça encontrada!';
      resultButton.className = isMalicious ? 'threat-detected' : 'no-threat';

      const detailsDiv = document.createElement('div');
      detailsDiv.innerHTML = `<pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
      detailsDiv.style.display = 'none';

      const toggleButton = document.createElement('button');
      toggleButton.textContent = 'Mostrar detalhes técnicos';
      toggleButton.className = 'toggle-details';
      toggleButton.onclick = () => {
        const isHidden = detailsDiv.style.display === 'none';
        detailsDiv.style.display = isHidden ? 'block' : 'none';
        toggleButton.textContent = isHidden ? 'Ocultar detalhes' : 'Mostrar detalhes técnicos';
      };

      resultsDiv.appendChild(resultButton);
      resultsDiv.appendChild(toggleButton);
      resultsDiv.appendChild(detailsDiv);
    } else {
      const extra = { status: data.status, vtError: data.vt || null };
      resultsDiv.innerHTML = `<pre style="color:#ef4444;">Erro: ${data.erro || 'Resposta inválida da API'}\n${data.detalhe || ''}\n${escapeHtml(JSON.stringify(extra, null, 2))}</pre>`;
    }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
