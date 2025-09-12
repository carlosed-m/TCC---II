// Importação das dependências necessárias
// dotenv: Para carregar variáveis de ambiente
// express: Framework web para Node.js
// axios: Cliente HTTP para fazer requisições
// multer: Middleware para upload de arquivos
// cors: Middleware para habilitar CORS
// fs: Sistema de arquivos do Node.js
// path: Manipulação de caminhos de arquivo
// FormData: Para criar formulários multipart
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuração inicial do servidor Express e middlewares
const app = express();
const upload = multer({ dest: path.join(__dirname, '../uploads') }); // Configura o diretório para upload de arquivos
const API_KEY = "3bff712a13371ad413ae5dfc49b8bb4f8ae5b476084fc945d496f2ad6721e4d5"; // Chave da API do VirusTotal

// Configuração dos middlewares
app.use(cors());
app.use(express.json());

// Verificação de chave logo no boot (ajuda a falhar com mensagem clara)
if (!API_KEY) {
  console.log("VT_API_KEY carregada?", API_KEY ? "Sim" : "Não");
}

// Conexão com o front-end
app.use(express.static(path.join(__dirname, '../front-end')));
app.use('/tips', express.static(path.join(__dirname, '../tips')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../front-end/index.html'));
});

// Função helper: polling do resultado da análise
async function pollAnalysis(analysisId) {
  const VIRUSTOTAL_BASE_URL = 'https://www.virustotal.com/api/v3';
  const maxAttempts = 30; // Máximo 30 tentativas (5 minutos)
  const pollInterval = 10000; // 10 segundos entre tentativas

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Tentativa ${attempt}/${maxAttempts} - Verificando status da análise: ${analysisId}`);
      
      const response = await axios.get(`${VIRUSTOTAL_BASE_URL}/analyses/${analysisId}`, {
        headers: { 'x-apikey': API_KEY },
        timeout: 15000
      });

      const status = response.data?.data?.attributes?.status;
      console.log(`Status atual: ${status}`);

      if (status === 'completed') {
        console.log('Análise concluída! Retornando resultado.');
        return response.data;
      }

      if (attempt < maxAttempts) {
        console.log(`Aguardando ${pollInterval/1000} segundos antes da próxima verificação...`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }

    } catch (error) {
      console.error(`Erro na tentativa ${attempt}:`, error.message);
      
      if (attempt === maxAttempts) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  throw new Error('Timeout: Análise não foi concluída no tempo esperado');
}

// Verificação de URL
app.post('/verificar-url', async (req, res) => {
  const { url } = req.body;

  if (!API_KEY) {
    return res.status(500).json({
      erro: 'Configuração ausente',
      detalhe: 'Defina VT_API_KEY no arquivo .env'
    });
  }

  if (!url || !/^https?:\/\/.+/i.test(url)) {
    return res.status(400).json({
      erro: 'URL inválida',
      detalhe: 'Envie uma URL completa iniciando com http:// ou https://'
    });
  }

  try {
    // Envia URL para análise
    const uploadResponse = await axios.post(
      'https://www.virustotal.com/api/v3/urls',
      `url=${encodeURIComponent(url)}`,
      {
        headers: {
          'x-apikey': API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 15000
      }
    );

    const analysisId = uploadResponse.data.data.id;

    // Aguarda resultado da análise usando polling
    const resultado = await pollAnalysis(analysisId);

    res.json(resultado);

  } catch (error) {
    console.error('Erro na verificação:', error.message);
    res.status(500).json({
      erro: 'Erro na verificação',
      detalhe: error.message
    });
  }
});

// Verificação de Arquivo
app.post('/verificar-arquivo', upload.single('file'), async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({
      erro: 'Configuração ausente',
      detalhe: 'Defina VT_API_KEY no arquivo .env'
    });
  }

  const filePath = req.file?.path;
  if (!filePath) {
    return res.status(400).json({ erro: 'Arquivo não recebido' });
  }

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const uploadResponse = await axios.post(
      'https://www.virustotal.com/api/v3/files',
      form,
      { headers: { ...form.getHeaders(), 'x-apikey': API_KEY }, timeout: 30000 }
    );

    const analysisId = uploadResponse.data?.data?.id;
    if (!analysisId) throw new Error('Não foi possível obter o ID da análise');

    const analysisData = await pollAnalysis(analysisId);
    
    return res.json(analysisData);
  } catch (error) {
    const status = error.response?.status;
    const vt = error.response?.data;
    console.error('Erro na verificação de arquivo:', status, vt || error.message);

    return res.status(500).json({
      erro: 'Erro ao verificar arquivo',
      detalhe: error.message,
      status,
      vt
    });
  } finally {
    try { if (filePath) fs.unlinkSync(filePath); } catch {}
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
