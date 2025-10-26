const pool = require('../config/db');

// Salvar histórico de verificação
exports.saveVerification = async (req, res) => {
    try {
        const { type, target, result, status, threat_count } = req.body;
        const userId = req.user.userId; // Vem do middleware de autenticação

        // Validações básicas
        if (!type || !target || !result || !status) {
            return res.status(400).json({ 
                erro: 'Dados obrigatórios', 
                detalhe: 'Tipo, alvo, resultado e status são obrigatórios' 
            });
        }

        // Inserir no histórico
        const historyResult = await pool.query(
            `INSERT INTO verification_history (user_id, type, target, result, status, threat_count) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [userId, type, target, JSON.stringify(result), status, threat_count || 0]
        );

        res.status(201).json({
            success: true,
            message: 'Verificação salva no histórico',
            history: historyResult.rows[0]
        });

    } catch (error) {
        console.error('Erro ao salvar histórico:', error);
        res.status(500).json({ 
            erro: 'Erro interno do servidor', 
            detalhe: 'Não foi possível salvar no histórico' 
        });
    }
};

// Obter histórico do usuário
exports.getUserHistory = async (req, res) => {
    try {
        const userId = req.user.userId; // Vem do middleware de autenticação
        const { page = 1, limit = 10, type, status, search } = req.query;
        
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT id, type, target, status, threat_count, scan_date, created_at 
            FROM verification_history 
            WHERE user_id = $1
        `;
        let queryParams = [userId];
        
        // Filtrar por tipo
        if (type && (type === 'url' || type === 'file')) {
            query += ` AND type = $${queryParams.length + 1}`;
            queryParams.push(type);
        }
        
        // Filtrar por status
        if (status) {
            if (status === 'clean') {
                query += ` AND threat_count = 0`;
            } else if (status === 'suspicious') {
                query += ` AND threat_count > 0 AND threat_count <= 3`;
            } else if (status === 'malicious') {
                query += ` AND threat_count > 3`;
            }
        }
        
        // Filtrar por busca
        if (search) {
            query += ` AND (target ILIKE $${queryParams.length + 1})`;
            queryParams.push(`%${search}%`);
        }
        
        query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, offset);

        const result = await pool.query(query, queryParams);

        // Contar total de registros com os mesmos filtros
        let countQuery = 'SELECT COUNT(*) FROM verification_history WHERE user_id = $1';
        let countParams = [userId];
        
        if (type && (type === 'url' || type === 'file')) {
            countQuery += ` AND type = $${countParams.length + 1}`;
            countParams.push(type);
        }
        
        if (status) {
            if (status === 'clean') {
                countQuery += ` AND threat_count = 0`;
            } else if (status === 'suspicious') {
                countQuery += ` AND threat_count > 0 AND threat_count <= 3`;
            } else if (status === 'malicious') {
                countQuery += ` AND threat_count > 3`;
            }
        }
        
        if (search) {
            countQuery += ` AND (target ILIKE $${countParams.length + 1})`;
            countParams.push(`%${search}%`);
        }
        
        const countResult = await pool.query(countQuery, countParams);
        const totalRecords = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                current_page: parseInt(page),
                total_pages: totalPages,
                total_records: totalRecords,
                per_page: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({ 
            erro: 'Erro interno do servidor', 
            detalhe: 'Não foi possível buscar o histórico' 
        });
    }
};

// Obter detalhes de uma verificação específica
exports.getVerificationDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        console.log('🔍 Buscando verificação ID:', id, 'para usuário:', userId);

        const result = await pool.query(
            'SELECT * FROM verification_history WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        console.log('📊 Resultado da query:', result.rows.length, 'registros encontrados');

        if (result.rows.length === 0) {
            console.log('❌ Verificação não encontrada - ID:', id, 'User:', userId);
            return res.status(404).json({ 
                erro: 'Verificação não encontrada', 
                detalhe: 'Esta verificação não existe ou não pertence ao usuário' 
            });
        }

        const verification = result.rows[0];
        console.log('📄 Dados da verificação:', {
            id: verification.id,
            user_id: verification.user_id,
            type: verification.type,
            target: verification.target,
            result_type: typeof verification.result
        });
        
        // Parse do resultado JSON com melhor tratamento de erro
        let parsedResult;
        try {
            if (verification.result && typeof verification.result === 'string') {
                console.log('🔄 Fazendo parse de string JSON...');
                parsedResult = JSON.parse(verification.result);
                console.log('✅ Parse JSON bem-sucedido');
            } else if (verification.result && typeof verification.result === 'object') {
                console.log('✅ Result já é objeto JSON');
                parsedResult = verification.result;
            } else {
                console.log('⚠️ Tipo de result inesperado:', typeof verification.result);
                parsedResult = verification.result;
            }
        } catch (parseError) {
            console.error('❌ Erro ao fazer parse do result JSON:', parseError.message);
            console.log('📋 Result original (primeiros 100 chars):', 
                typeof verification.result === 'string' 
                    ? verification.result.substring(0, 100) + '...'
                    : verification.result
            );
            parsedResult = verification.result; // Mantém como está se não conseguir fazer parse
        }

        // Criar uma resposta com detalhes técnicos estruturados
        const detailedResponse = {
            id: verification.id,
            tipo: verification.type,
            alvo: verification.target,
            status: verification.status,
            ameacas_detectadas: verification.threat_count,
            data_verificacao: verification.scan_date,
            
            // Detalhes técnicos do resultado
            detalhes_tecnicos: {
                total_engines: 0,
                limpos: 0,
                maliciosos: 0,
                suspeitos: 0,
                nao_detectados: 0,
                timeout: 0,
                engines_detectaram: []
            },
            
            // Dados originais para o debug
            resultado_completo: parsedResult
        };

        // Extrair estatísticas dos dados do VirusTotal
        if (parsedResult && typeof parsedResult === 'object') {
            console.log('📊 Processando dados do VirusTotal...');
            
            const stats = parsedResult.data?.attributes?.stats;
            if (stats) {
                console.log('✅ Estatísticas encontradas:', stats);
                
                // Formato do VirusTotal v3
                detailedResponse.detalhes_tecnicos.total_engines = 
                    (stats.harmless || 0) + (stats.malicious || 0) + 
                    (stats.suspicious || 0) + (stats.undetected || 0) + (stats.timeout || 0);
                detailedResponse.detalhes_tecnicos.limpos = stats.harmless || 0;
                detailedResponse.detalhes_tecnicos.maliciosos = stats.malicious || 0;
                detailedResponse.detalhes_tecnicos.suspeitos = stats.suspicious || 0;
                detailedResponse.detalhes_tecnicos.nao_detectados = stats.undetected || 0;
                detailedResponse.detalhes_tecnicos.timeout = stats.timeout || 0;
                
                // Extrair as engines que detectaram ameaças
                const results = parsedResult.data?.attributes?.results;
                if (results) {
                    const enginesComAmeacas = [];
                    Object.keys(results).forEach(engineName => {
                        const result = results[engineName];
                        if (result.category === 'malicious') {
                            enginesComAmeacas.push({
                                nome: engineName,
                                resultado: result.result,
                                categoria: result.category
                            });
                        }
                    });
                    detailedResponse.detalhes_tecnicos.engines_detectaram = enginesComAmeacas;
                }
                
                console.log('📈 Estatísticas processadas:', {
                    total: detailedResponse.detalhes_tecnicos.total_engines,
                    limpos: detailedResponse.detalhes_tecnicos.limpos,
                    maliciosos: detailedResponse.detalhes_tecnicos.maliciosos,
                    suspeitos: detailedResponse.detalhes_tecnicos.suspeitos
                });
            } else if (parsedResult.scans) {
                console.log('📊 Usando formato alternativo (scans)');
                // Formato VirusTotal v2 ou customizado
                detailedResponse.detalhes_tecnicos.total_engines = parsedResult.scans || 0;
                detailedResponse.detalhes_tecnicos.limpos = parsedResult.clean || 0;
                detailedResponse.detalhes_tecnicos.maliciosos = parsedResult.malicious || 0;
                detailedResponse.detalhes_tecnicos.suspeitos = parsedResult.suspicious || 0;
            } else {
                console.log('⚠️ Estrutura de dados não reconhecida para extração de estatísticas');
            }
        }

        console.log('✅ Resposta estruturada criada com sucesso');
        res.json({
            success: true,
            data: detailedResponse
        });

    } catch (error) {
        console.error('❌ Erro completo ao buscar detalhes da verificação:', error);
        console.error('📋 Stack trace:', error.stack);
        res.status(500).json({ 
            erro: 'Erro interno do servidor', 
            detalhe: 'Não foi possível buscar os detalhes da verificação',
            debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Excluir uma verificação do histórico
exports.deleteVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            'DELETE FROM verification_history WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                erro: 'Verificação não encontrada', 
                detalhe: 'Esta verificação não existe ou não pertence ao usuário' 
            });
        }

        res.json({
            success: true,
            message: 'Verificação removida do histórico'
        });

    } catch (error) {
        console.error('Erro ao deletar verificação:', error);
        res.status(500).json({ 
            erro: 'Erro interno do servidor', 
            detalhe: 'Não foi possível remover a verificação' 
        });
    }
};

// Obter as estatísticas do usuário
exports.getUserStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total_scans,
                COUNT(CASE WHEN type = 'url' THEN 1 END) as total_urls,
                COUNT(CASE WHEN type = 'file' THEN 1 END) as total_files,
                COUNT(CASE WHEN status = 'clean' THEN 1 END) as clean_scans,
                COUNT(CASE WHEN status != 'clean' THEN 1 END) as threat_scans
            FROM verification_history 
            WHERE user_id = $1
        `, [userId]);

        res.json({
            success: true,
            data: stats.rows[0]
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ 
            erro: 'Erro interno do servidor', 
            detalhe: 'Não foi possível buscar as estatísticas' 
        });
    }
};

// Gerar o PDF da verificação
exports.generateVerificationPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        
        console.log('🎯 Gerando PDF para verificação ID:', id, 'Usuário:', userId);

        // Buscar dados da verificação
        const result = await pool.query(
            'SELECT * FROM verification_history WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                erro: 'Verificação não encontrada',
                detalhe: 'Esta verificação não existe ou não pertence ao usuário'
            });
        }

        const verification = result.rows[0];
        console.log('📄 Verificação encontrada:', verification.target);

        // Parse do resultado
        let parsedResult;
        try {
            parsedResult = typeof verification.result === 'string' 
                ? JSON.parse(verification.result) 
                : verification.result;
        } catch (parseError) {
            console.error('❌ Erro no parse:', parseError);
            parsedResult = verification.result;
        }

        // Extrair as estatísticas
        const stats = parsedResult?.data?.attributes?.stats || {};
        const totalEngines = (stats.harmless || 0) + (stats.malicious || 0) + 
                           (stats.suspicious || 0) + (stats.undetected || 0) + (stats.timeout || 0);

        // Gerar o PDF usando o mesmo layout da tela inicial
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 20 });
        
        // Headers para download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio_seguranca_${verification.id}.pdf"`);
        
        // Pipe para resposta
        doc.pipe(res);

        // Configurações
        const pageWidth = doc.page.width;
        const margin = 20;
        let yPosition = 30;

        // Função auxiliar para adicionar texto com quebra de linha
        function addText(text, x, y, options = {}) {
            const maxWidth = options.maxWidth || (pageWidth - 2 * margin);
            const fontSize = options.fontSize || 12;
            const isBold = options.bold || false;
            
            doc.fontSize(fontSize);
            doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica');
            
            // Calcular altura necessária
            const lines = doc.heightOfString(text, { width: maxWidth });
            doc.text(text, x, y, { width: maxWidth });
            
            return y + lines + 5;
        }

        // Cabeçalho
        doc.rect(0, 0, pageWidth, 25).fill('#3B82F6');
        
        doc.fillColor('#FFFFFF');
        doc.fontSize(16).font('Helvetica-Bold');
        doc.text('RELATÓRIO DE VERIFICAÇÃO DE SEGURANÇA', margin, 15);
        
        // Reset cor do texto
        doc.fillColor('#000000');
        yPosition += 10;
        
        // Traduzir os status para português
        function translateStatus(status) {
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

        // Informações gerais
        yPosition = addText('INFORMAÇÕES GERAIS', margin, yPosition, { fontSize: 14, bold: true });
        yPosition = addText(`Data/Hora: ${new Date(verification.scan_date).toLocaleString('pt-BR')}`, margin, yPosition);
        yPosition = addText(`Tipo de Análise: ${verification.type === 'url' ? 'URL' : 'Arquivo'}`, margin, yPosition);
        yPosition = addText(`${verification.type === 'url' ? 'URL' : 'Arquivo'} Analisado: ${verification.target}`, margin, yPosition);
        yPosition = addText(`Status da Verificação: ${translateStatus(verification.status)}`, margin, yPosition);
        
        yPosition += 10;
        
        // Resultado da análise (caixa colorida)
        const isMalicious = verification.threat_count > 0;
        const resultColor = isMalicious ? '#EF4444' : '#22C55E';
        const resultText = isMalicious ? 'AMEAÇA DETECTADA' : 'NENHUMA AMEAÇA ENCONTRADA';
        
        doc.rect(margin, yPosition - 8, pageWidth - 2 * margin, 20).fill(resultColor);
        
        doc.fillColor('#FFFFFF');
        doc.fontSize(14).font('Helvetica-Bold');
        doc.text(resultText, margin + 5, yPosition);
        
        doc.fillColor('#000000');
        yPosition += 25;
        
        // Estatísticas da análise
        yPosition = addText('ESTATÍSTICAS DA ANÁLISE', margin, yPosition, { fontSize: 14, bold: true });
        
        yPosition = addText(`- Seguros: ${stats.harmless || 0} antivírus`, margin + 5, yPosition);
        yPosition = addText(`- Maliciosos: ${stats.malicious || 0} antivírus`, margin + 5, yPosition);
        yPosition = addText(`- Suspeitos: ${stats.suspicious || 0} antivírus`, margin + 5, yPosition);
        yPosition = addText(`- Não detectados: ${stats.undetected || 0} antivírus`, margin + 5, yPosition);
        
        yPosition += 10;
        
        // Dica de segurança
        yPosition = addText('DICA DE SEGURANÇA', margin, yPosition, { fontSize: 14, bold: true });
        const securityTip = isMalicious 
            ? 'Ameaça detectada! Evite interagir com este conteúdo e mantenha seu antivírus atualizado.'
            : 'Conteúdo considerado seguro. Continue mantendo boas práticas de segurança digital.';
        yPosition = addText(securityTip, margin + 5, yPosition);
        
        yPosition += 10;

        // Engines maliciosos detalhados (se houver)
        if (stats.malicious > 0 && parsedResult?.data?.attributes?.results) {
            yPosition = addText('DETECÇÕES ESPECÍFICAS', margin, yPosition, { fontSize: 14, bold: true });
            
            const results = parsedResult.data.attributes.results;
            Object.keys(results).forEach(engineName => {
                const result = results[engineName];
                if (result.category === 'malicious') {
                    // Traduzir os resultados comuns das engines
                    const translatedResult = result.result
                        .replace(/malware/gi, 'malware')
                        .replace(/trojan/gi, 'trojan')
                        .replace(/virus/gi, 'vírus')
                        .replace(/suspicious/gi, 'suspeito')
                        .replace(/clean/gi, 'limpo')
                        .replace(/detected/gi, 'detectado')
                        .replace(/undetected/gi, 'não detectado');
                    
                    yPosition = addText(`- ${engineName}: ${translatedResult}`, margin + 5, yPosition, { fontSize: 10 });
                }
            });
        }
        
        // Rodapé
        doc.fontSize(10).fillColor('#808080');
        doc.text('Relatório gerado automaticamente pelo sistema No Matters', margin, doc.page.height - 25);
        doc.text(`Página 1 de 1 - ${new Date().toLocaleString('pt-BR')}`, pageWidth - margin - 100, doc.page.height - 25);

        // Finalizar o PDF
        doc.end();
        
        console.log('✅ PDF gerado e enviado com sucesso');

    } catch (error) {
        console.error('❌ Erro ao gerar PDF:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor',
            detalhe: 'Não foi possível gerar o PDF'
        });
    }
};

// Gerar o PDF temporário (sem salvar no histórico)
exports.generateTemporaryPDF = async (req, res) => {
    try {
        const { type, target, result, status, threat_count, scan_date } = req.body;
        
        console.log('🎯 Gerando PDF temporário para:', { type, target, status });

        // Validações básicas
        if (!type || !target || !result) {
            return res.status(400).json({
                erro: 'Dados obrigatórios',
                detalhe: 'Tipo, alvo e resultado são obrigatórios'
            });
        }

        // Criar o objeto simulando uma verificação do histórico
        const verification = {
            id: 'temp',
            type,
            target,
            status: status || 'clean',
            threat_count: threat_count || 0,
            scan_date: scan_date ? new Date(scan_date) : new Date()
        };

        // Processar o resultado (mesmo código da função original)
        let parsedResult;
        try {
            parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
        } catch (parseError) {
            console.warn('⚠️  Erro ao fazer parse do resultado:', parseError);
            parsedResult = result;
        }

        // Estatísticas padrão
        let stats = {
            harmless: 0,
            malicious: 0,
            suspicious: 0,
            undetected: 0,
            timeout: 0
        };

        if (parsedResult?.data?.attributes?.last_analysis_stats) {
            stats = { ...stats, ...parsedResult.data.attributes.last_analysis_stats };
        } else if (parsedResult?.data?.attributes?.stats) {
            stats = { ...stats, ...parsedResult.data.attributes.stats };
        }

        const totalEngines = (stats.harmless || 0) + (stats.malicious || 0) + 
                           (stats.suspicious || 0) + (stats.undetected || 0) + (stats.timeout || 0);

        // Gerar o PDF usando o mesmo layout da função original
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 20 });
        
        // Headers para o download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio_seguranca_temp.pdf"`);
        
        // Pipe para resposta
        doc.pipe(res);

        // Configurações
        const pageWidth = doc.page.width;
        const margin = 20;
        let yPosition = 30;

        // Função auxiliar para adicionar o texto com quebra de linha
        function addText(text, x, y, options = {}) {
            const maxWidth = options.maxWidth || (pageWidth - 2 * margin);
            const fontSize = options.fontSize || 12;
            const isBold = options.bold || false;
            
            doc.fontSize(fontSize);
            doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica');
            
            // Calcular a altura necessária
            const lines = doc.heightOfString(text, { width: maxWidth });
            doc.text(text, x, y, { width: maxWidth });
            
            return y + lines + 5;
        }

        // Cabeçalho
        doc.rect(0, 0, pageWidth, 25).fill('#3B82F6');
        
        doc.fillColor('#FFFFFF');
        doc.fontSize(16).font('Helvetica-Bold');
        doc.text('RELATÓRIO DE VERIFICAÇÃO DE SEGURANÇA', margin, 15);
        
        // Reset cor do texto
        doc.fillColor('#000000');
        yPosition += 10;
        
        // Traduzir os status para português
        function translateStatus(status) {
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

        // Informações gerais
        yPosition = addText('INFORMAÇÕES GERAIS', margin, yPosition, { fontSize: 14, bold: true });
        yPosition = addText(`Data/Hora: ${new Date(verification.scan_date).toLocaleString('pt-BR')}`, margin, yPosition);
        yPosition = addText(`Tipo de Análise: ${verification.type === 'url' ? 'URL' : 'Arquivo'}`, margin, yPosition);
        yPosition = addText(`${verification.type === 'url' ? 'URL' : 'Arquivo'} Analisado: ${verification.target}`, margin, yPosition);
        yPosition = addText(`Status da Verificação: ${translateStatus(verification.status)}`, margin, yPosition);
        
        yPosition += 10;
        
        // Resultado da análise (caixa colorida)
        const isMalicious = verification.threat_count > 0;
        const resultColor = isMalicious ? '#EF4444' : '#22C55E';
        const resultText = isMalicious ? 'AMEAÇA DETECTADA' : 'NENHUMA AMEAÇA ENCONTRADA';
        
        doc.rect(margin, yPosition - 8, pageWidth - 2 * margin, 20).fill(resultColor);
        
        doc.fillColor('#FFFFFF');
        doc.fontSize(14).font('Helvetica-Bold');
        doc.text(resultText, margin + 5, yPosition);
        
        doc.fillColor('#000000');
        yPosition += 25;
        
        // Estatísticas da análise
        yPosition = addText('ESTATÍSTICAS DA ANÁLISE', margin, yPosition, { fontSize: 14, bold: true });
        
        yPosition = addText(`- Seguros: ${stats.harmless || 0} antivírus`, margin + 5, yPosition);
        yPosition = addText(`- Maliciosos: ${stats.malicious || 0} antivírus`, margin + 5, yPosition);
        yPosition = addText(`- Suspeitos: ${stats.suspicious || 0} antivírus`, margin + 5, yPosition);
        yPosition = addText(`- Não detectados: ${stats.undetected || 0} antivírus`, margin + 5, yPosition);
        
        yPosition += 10;
        
        // Dica de segurança
        yPosition = addText('DICA DE SEGURANÇA', margin, yPosition, { fontSize: 14, bold: true });
        const securityTip = isMalicious 
            ? 'Ameaça detectada! Evite interagir com este conteúdo e mantenha seu antivírus atualizado.'
            : 'Conteúdo considerado seguro. Continue mantendo boas práticas de segurança digital.';
        yPosition = addText(securityTip, margin + 5, yPosition);
        
        yPosition += 10;

        // Engines maliciosos detalhados (se houver)
        if (stats.malicious > 0 && parsedResult?.data?.attributes?.last_analysis_results) {
            yPosition = addText('DETECÇÕES ESPECÍFICAS', margin, yPosition, { fontSize: 14, bold: true });
            
            const results = parsedResult.data.attributes.last_analysis_results;
            Object.keys(results).slice(0, 5).forEach(engineName => {
                const result = results[engineName];
                if (result.category === 'malicious') {
                    // Traduzir os resultados comuns das engines
                    const translatedResult = result.result
                        ?.replace(/malware/gi, 'malware')
                        ?.replace(/trojan/gi, 'trojan')
                        ?.replace(/virus/gi, 'vírus')
                        ?.replace(/suspicious/gi, 'suspeito')
                        ?.replace(/clean/gi, 'limpo')
                        ?.replace(/detected/gi, 'detectado')
                        ?.replace(/undetected/gi, 'não detectado') || 'Ameaça detectada';
                    
                    yPosition = addText(`- ${engineName}: ${translatedResult}`, margin + 5, yPosition, { fontSize: 10 });
                }
            });
        }
        
        // Rodapé
        doc.fontSize(10).fillColor('#808080');
        doc.text('Relatório gerado automaticamente pelo sistema No Matters', margin, doc.page.height - 25);
        doc.text(`Página 1 de 1 - ${new Date().toLocaleString('pt-BR')}`, pageWidth - margin - 100, doc.page.height - 25);

        // Finalizar o PDF
        doc.end();
        
        console.log('✅ PDF temporário gerado e enviado com sucesso');

    } catch (error) {
        console.error('❌ Erro ao gerar PDF temporário:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor',
            detalhe: 'Não foi possível gerar o PDF temporário'
        });
    }
};