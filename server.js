const express = require('express');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const app = express();
const upload = multer({ dest: 'uploads/' });
const API_KEY = '3bff712a13371ad413ae5dfc49b8bb4f8ae5b476084fc945d496f2ad6721e4d5'; // API KEY do VirusTotal

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve arquivos estáticos da raiz

// Rota para a página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Verificação de URL
app.post('/verificar-url', async (req, res) => {
    const { url } = req.body;

    try {
        // 1️⃣ Enviar URL para análise
        const uploadResponse = await axios.post(
            'https://www.virustotal.com/api/v3/urls',
            `url=${encodeURIComponent(url)}`,
            {
                headers: {
                    'x-apikey': API_KEY,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const analysisId = uploadResponse.data.data.id;

        // Fazer a consulta do resultado
        const analysisResponse = await axios.get(
            `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
            {
                headers: { 'x-apikey': API_KEY }
            }
        );

        res.json(analysisResponse.data);
    } catch (error) {
        console.error('Erro na verificação de URL:', error.response?.data || error.message);
        res.status(500).json({ erro: 'Erro ao verificar URL' });
    }
});

// Verificação do Arquivo
app.post('/verificar-arquivo', upload.single('file'), async (req, res) => {
    const filePath = req.file.path;

    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        const uploadResponse = await axios.post('https://www.virustotal.com/api/v3/files', form, {
            headers: {
                ...form.getHeaders(),
                'x-apikey': API_KEY // Usando a mesma chave
            }
        });

        const analysisId = uploadResponse.data.data.id;

        const result = await axios.get(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
            headers: { 'x-apikey': API_KEY }
        });

        res.json(result.data);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao verificar arquivo', detalhe: error.message });
    } finally {
        fs.unlinkSync(filePath); // Remove o arquivo temporário
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});