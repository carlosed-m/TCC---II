const securityTips = {
    safe: [
        // Dicas Básicas de Segurança
        "Mantenha seu sistema operacional e programas sempre atualizados com as últimas correções de segurança.",
        "Use senhas fortes e únicas para cada conta - combine letras, números e símbolos.",
        "Ative a autenticação de dois fatores (2FA) em todas as contas importantes.",
        "Faça backups regulares dos seus dados importantes em locais seguros e offline.",
        "Evite clicar em links suspeitos em emails ou mensagens de origem desconhecida.",
        "Mantenha um antivírus atualizado e execute verificações regulares no seu dispositivo.",
        "Verifique sempre a fonte e reputação dos arquivos antes de baixá-los.",
        "Use uma VPN confiável ao acessar redes Wi-Fi públicas ou desprotegidas.",
        
        // Dicas Avançadas
        "Configure um firewall para monitorar e bloquear tráfego suspeito.",
        "Use um gerenciador de senhas para criar e armazenar senhas seguras.",
        "Ative notificações de login em suas contas para detectar acessos não autorizados.",
        "Mantenha apenas os programas necessários instalados - remova software não utilizado.",
        "Verifique regularmente as permissões de aplicativos em dispositivos móveis.",
        "Use navegadores atualizados com bloqueadores de pop-ups e scripts maliciosos.",
        "Desconfie de downloads automáticos ou instalações que você não iniciou.",
        "Mantenha cópias offline de documentos importantes em dispositivos desconectados.",
        
        // Educação e Conscientização
        "Eduque-se sobre as últimas táticas de engenharia social e phishing.",
        "Verifique se os sites usam HTTPS (cadeado fechado) antes de inserir dados pessoais.",
        "Desconfie de ofertas muito boas para ser verdade ou urgências extremas.",
        "Mantenha-se informado sobre as últimas ameaças de segurança cibernética.",
        "Considere usar sistemas operacionais focados em privacidade para atividades sensíveis.",
        "Revise periodicamente as configurações de privacidade em redes sociais.",
        "Use redes sociais com moderação e evite compartilhar informações pessoais demais.",
        "Seja cauteloso com dispositivos USB ou pen drives de origem desconhecida.",
        
        // Práticas Empresariais
        "Implemente políticas de segurança claras em ambientes corporativos.",
        "Treine funcionários sobre reconhecimento de ameaças cibernéticas.",
        "Use soluções de backup automatizadas e testadas regularmente.",
        "Monitore logs de sistema e atividades de rede para detectar anomalias.",
        "Implemente princípios de menor privilégio no acesso a sistemas.",
        "Mantenha inventário atualizado de todos os dispositivos conectados à rede."
    ],
    
    threats: {
        malware: [
            // Ações Imediatas
            "AÇÃO URGENTE: Desconecte imediatamente o dispositivo da internet.",
            "Remova ou isole o arquivo/programa suspeito identificado na verificação.",
            "Execute uma varredura completa do sistema com múltiplos antivírus atualizados.",
            "Verifique todos os programas instalados recentemente e remova os suspeitos.",
            "Monitore atividades suspeitas: CPU alta, rede lenta, pop-ups inesperados.",
            
            // Investigação e Limpeza
            "Verifique o gerenciador de tarefas por processos desconhecidos ou com alto consumo.",
            "Analise os arquivos temporários e downloads recentes em busca de ameaças.",
            "Revise as configurações de inicialização do sistema para programas não autorizados.",
            "Escaneie dispositivos USB e externos que foram conectados recentemente.",
            "Considere usar um disco de boot antivírus para limpeza mais profunda.",
            
            // Prevenção Futura
            "Ative a proteção em tempo real e mantenha definições de vírus atualizadas.",
            "Configure o sistema para fazer backups automáticos antes de instalar software.",
            "Use contas de usuário limitadas para atividades diárias (não administrador).",
            "Implemente listas brancas de aplicativos se possível.",
            "Considere usar sandboxing para executar programas suspeitos com segurança.",
            
            // Recuperação
            "Restaure arquivos importantes a partir de backups verificados como limpos.",
            "Altere todas as senhas após a limpeza completa do sistema.",
            "Monitore contas bancárias e cartões por atividades suspeitas.",
            "Considere formatar e reinstalar o sistema em casos severos de infecção."
        ],
        
        phishing: [
            // Reconhecimento
            "ALERTA: Esta pode ser uma tentativa de roubo de dados pessoais.",
            "Nunca forneça senhas, números de cartão ou dados pessoais através de links recebidos.",
            "Verifique sempre o endereço real do site - fraudadores usam URLs similares.",
            "Desconfie de urgências extremas, ofertas limitadas ou ameaças de fechamento de conta.",
            "Observe erros de gramática, logos de baixa qualidade ou formatação estranha.",
            
            // Verificação
            "Digite o endereço do site oficial diretamente no navegador em vez de clicar no link.",
            "Entre em contato com a empresa através de canais oficiais para verificar a legitimidade.",
            "Verifique se o email foi enviado do domínio oficial da empresa.",
            "Use ferramentas de verificação de reputação de sites antes de prosseguir.",
            "Consulte bancos de dados de phishing conhecidos para confirmar ameaças.",
            
            // Proteção
            "Ative filtros anti-phishing em seu email e navegador.",
            "Use autenticação de dois fatores para adicionar uma camada extra de proteção.",
            "Mantenha informações pessoais privadas em redes sociais.",
            "Eduque familiares e colegas sobre estas táticas de engenharia social.",
            "Reporte tentativas de phishing às autoridades e empresas afetadas.",
            
            // Ação Corretiva
            "Se já forneceu dados, altere imediatamente todas as senhas relacionadas.",
            "Monitore extratos bancários e relatórios de crédito por atividades suspeitas.",
            "Entre em contato com bancos e empresas para reportar possível comprometimento.",
            "Considere congelar seu relatório de crédito temporariamente."
        ],
        
        suspicious: [
            // Ações Preventivas
            "CUIDADO: Esta URL apresenta comportamento suspeito - evite acessar.",
            "Não compartilhe este link com outras pessoas para evitar propagação de ameaças.",
            "Evite baixar qualquer arquivo ou software a partir desta fonte.",
            "Não insira informações pessoais ou credenciais neste site.",
            "Use navegação privada/incógnita se precisar investigar mais (com muito cuidado).",
            
            // Limpeza e Proteção
            "Limpe o cache, cookies e histórico do navegador após exposição.",
            "Execute uma verificação de malware no dispositivo usado para acessar o site.",
            "Verifique se não foram instalados certificados ou extensões suspeitas no navegador.",
            "Monitore o comportamento do dispositivo por alguns dias após a exposição.",
            "Considere usar uma máquina virtual para investigações futuras de sites suspeitos.",
            
            // Reportar e Alertar
            "Reporte o site para serviços de segurança como Google Safe Browsing.",
            "Notifique seu provedor de internet sobre a ameaça descoberta.",
            "Compartilhe informações sobre a ameaça em fóruns de segurança apropriados.",
            "Alerte colegas e familiares sobre esta ameaça específica.",
            "Considere usar serviços de threat intelligence para rastrear a evolução da ameaça.",
            
            // Análise Adicional
            "Use ferramentas de análise online para obter mais informações sobre a ameaça.",
            "Verifique se outros usuários reportaram problemas similares com este domínio.",
            "Analise o histórico WHOIS do domínio para identificar padrões suspeitos.",
            "Monitore subdominios relacionados que podem estar comprometidos."
        ],
        
        // Nova categoria para diferentes tipos de ameaças
        ransomware: [
            "EMERGÊNCIA: Possível ransomware detectado - desconecte IMEDIATAMENTE da rede.",
            "NÃO pague o resgate - isso não garante a recuperação dos dados e financia criminosos.",
            "Isole o dispositivo infectado para evitar propagação na rede.",
            "Identifique a variante do ransomware para buscar ferramentas de descriptografia gratuitas.",
            "Restaure dados a partir de backups offline que não foram comprometidos.",
            "Reporte o incidente às autoridades locais de segurança cibernética.",
            "Considere contratar especialistas em resposta a incidentes para casos complexos."
        ],
        
        spyware: [
            "Spyware pode estar coletando suas informações pessoais e atividades.",
            "Verifique programas executando em segundo plano e processos de rede suspeitos.",
            "Revise permissões de aplicativos e remova acessos desnecessários.",
            "Use ferramentas especializadas anti-spyware além do antivírus tradicional.",
            "Monitore contas online por acessos não autorizados ou alterações suspeitas.",
            "Considere resetar configurações do navegador para remover extensões maliciosas."
        ],
        
        adware: [
            "Adware pode estar exibindo propagandas indesejadas e rastreando sua navegação.",
            "Remova extensões e toolbars suspeitas instaladas recentemente no navegador.",
            "Use bloqueadores de propaganda confiáveis para prevenir futuras infecções.",
            "Verifique a página inicial e mecanismo de busca padrão do navegador.",
            "Desinstale programas gratuitos que podem ter vindo com adware incluído.",
            "Reset completo do navegador pode ser necessário em casos persistentes."
        ]
    }
};

window.securityTips = securityTips;