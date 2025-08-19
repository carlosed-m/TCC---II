document.getElementById('urlForm').addEventListener('submit', async (e) => {
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
        
        if (!res.ok) throw new Error('Erro na resposta do servidor');
        
        const data = await res.json();
        exibirResultado(data);
    } catch (error) {
        exibirResultado({ erro: 'Erro na requisição URL', detalhe: error.message });
    } finally {
        mostrarLoader(false);
    }
});

document.getElementById('fileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('fileInput').files[0];
    if (!file) return;
    mostrarLoader(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch('/verificar-arquivo', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        exibirResultado(data);
    } catch (error) {
        exibirResultado({ erro: 'Erro na requisição de arquivo' });
    } finally {
        mostrarLoader(false);
    }
});

function mostrarLoader(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function exibirResultado(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Limpa o conteúdo anterior

    // Verifica se é uma resposta de URL ou arquivo
    if (data.data) {
        const attributes = data.data.attributes;
        let isMalicious = false;

        // Verifica se há ameaças (lógica para URL ou arquivo)
        if (attributes.last_analysis_stats) {
            isMalicious = attributes.last_analysis_stats.malicious > 0;
        } else if (attributes.stats) {
            isMalicious = attributes.stats.malicious > 0;
        }

        // Cria o botão de resultado
        const resultButton = document.createElement('button');
        resultButton.id = 'threatResult';
        resultButton.textContent = isMalicious ? '⚠️ Ameaça detectada!' : '✅ Nenhuma ameaça encontrada!';
        resultButton.className = isMalicious ? 'threat-detected' : 'no-threat';

        // Adiciona detalhes em um campo expandível
        const detailsDiv = document.createElement('div');
        detailsDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        detailsDiv.style.display = 'none';

        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Mostrar detalhes técnicos';
        toggleButton.className = 'toggle-details';
        toggleButton.onclick = () => {
            detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
            toggleButton.textContent = detailsDiv.style.display === 'none' ? 
                'Mostrar detalhes técnicos' : 'Ocultar detalhes';
        };

        resultsDiv.appendChild(resultButton);
        resultsDiv.appendChild(toggleButton);
        resultsDiv.appendChild(detailsDiv);
    } else {
        resultsDiv.textContent = 'Erro: ' + (data.erro || 'Resposta inválida da API');
    }
}