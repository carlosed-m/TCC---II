require('dotenv').config();
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const app = express();
const upload = multer({ dest: path.join(__dirname, '../uploads') }); // robusto qdo rodar da raiz
const API_KEY = "3bff712a13371ad413ae5dfc49b8bb4f8ae5b476084fc945d496f2ad6721e4d5";

app.use(cors());
app.use(express.json());

// Verificação de chave logo no boot (ajuda a falhar com mensagem clara)
if (!API_KEY) {
  console.log("VT_API_KEY carregada?", API_KEY ? "Sim" : "Não");
}

// 2) Servir o front-end corretamente
app.use(express.static(path.join(__dirname, '../front-end')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../front-end/index.html'));
});

// Função helper: polling do resultado da análise
async function pollAnalysis(analysisId, maxTries = 10, intervalMs = 1500) {
  for (let attempt = 1; attempt <= maxTries; attempt++) {
    const resp = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      { headers: { 'x-apikey': API_KEY }, timeout: 15000 }
    );

    const status = resp.data?.data?.attributes?.status;
    if (status === 'completed') return resp.data;

    // aguarda e tenta de novo
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error('Tempo de espera excedido ao aguardar a análise do VirusTotal');
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

    const analysisId = uploadResponse.data?.data?.id;
    if (!analysisId) throw new Error('Não foi possível obter o ID da análise');

    // Faz polling até completar
    const analysisData = await pollAnalysis(analysisId);
    return res.json(analysisData);
  } catch (error) {
    // Detalhar o erro para o front
    const status = error.response?.status;
    const vt = error.response?.data;
    console.error('Erro na verificação de URL:', status, vt || error.message);

    return res.status(500).json({
      erro: 'Erro ao verificar URL',
      detalhe: error.message,
      status,
      vt
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
