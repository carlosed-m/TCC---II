# Site de Verificação de Segurança com VirusTotal

Site de verificação de URLs e arquivos utilizando a API do VirusTotal, com backend em Node.js, frontend em HTML/CSS/JavaScript e banco de dados PostgreSQL.

## 📁 Estrutura do Projeto

```
TCC---II/
├── 📁 front-end/          # Interface do usuário
│   ├── index.html         # Página principal (verificação)
│   ├── login.html         # Página de login
│   ├── cadastro.html      # Página de cadastro
│   ├── historico.html     # Página de histórico
│   ├── script.js          # JavaScript principal
│   ├── 📁 css/            # Estilos
│   │   ├── style.css      # Estilos principais
│   │   ├── auth.css       # Estilos de autenticação
│   │   └── history.css    # Estilos do histórico
│   └── 📁 js/             # Scripts específicos
│       ├── auth.js        # Lógica de autenticação
│       └── history.js     # Lógica do histórico
├── 📁 back-end/           # Servidores backend
│   ├── server.js          # Servidor simples (VirusTotal only)
│   └── 📁 banco-e-rotas/  # API completa com banco
│       ├── 📁 src/        # Código fonte da API
│       │   ├── app.js     # Servidor principal
│       │   ├── 📁 config/ # Configurações
│       │   ├── 📁 controllers/ # Controladores
│       │   ├── 📁 middleware/  # Middlewares
│       │   ├── 📁 models/      # Modelos de dados
│       │   └── 📁 routes/      # Rotas da API
│       └── 📁 database/   # Scripts SQL
├── 📁 tips/               # Dicas de segurança
└── 📁 uploads/            # Arquivos temporários
```

## 🚀 Configuração e Instalação

### Pré-requisitos
- Node.js (>=14.0.0)
- PostgreSQL
- Chave da API do VirusTotal

### 1. Instalação das Dependências
```bash
npm install
```

### 2. Configuração do Banco de Dados
1. Execute o script SQL em `back-end/banco-e-rotas/database/create_tables.sql`
2. Configure as variáveis de ambiente (veja seção abaixo)

### 3. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=TccII

# JWT
JWT_SECRET=sua_chave_secreta_jwt

# VirusTotal
VT_API_KEY=sua_chave_api_virustotal
```

## 📋 Scripts Disponíveis

### Servidor Principal (Com Banco)
```bash
npm start        # Inicia a API completa na porta 3000
npm run dev      # Desenvolvimento com nodemon na porta 3000
```

### Servidor Legacy (Só VirusTotal)
```bash
npm run start:legacy    # Servidor simples na porta 3001
npm run dev:legacy      # Desenvolvimento na porta 3001
```

### Banco de Dados
```bash
npm run db:setup  # Instruções para setup do DB
```

## 🎯 Funcionalidades

### ✅ Implementadas
- **Verificação de URLs**: Análise de segurança de links
- **Verificação de Arquivos**: Upload e análise de arquivos
- **Sistema de Autenticação**: Login/cadastro com JWT
- **Histórico de Verificações**: Armazenamento no PostgreSQL
- **Relatórios PDF**: Geração de relatórios detalhados
- **Tema Escuro/Claro**: Alternância de temas
- **Interface Responsiva**: Adaptada para mobile

### 🔧 Tecnologias Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Node.js, Express.js
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens)
- **API Externa**: VirusTotal API v3
- **PDF**: jsPDF (frontend) + PDFKit (backend)

## 🌐 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Cadastro de usuário
- `GET /api/auth/me` - Dados do usuário logado

### Histórico
- `GET /api/history` - Listar verificações
- `POST /api/history` - Salvar verificação
- `DELETE /api/history/:id` - Excluir verificação
- `GET /api/history/:id/pdf` - Gerar PDF

### Status
- `GET /api/status` - Status da API

## 🏗️ Arquitetura

### Dois Servidores Backend
1. **Servidor Legacy** (`server.js`):
   - Integração direta com VirusTotal
   - Sem persistência de dados
   - Ideal para testes rápidos

2. **API Completa** (`banco-e-rotas/`):
   - Sistema completo com banco
   - Autenticação JWT
   - Histórico persistente
   - Geração de relatórios

### Sistema de Temas
- CSS Variables para fácil customização
- Persistência via localStorage
- Suporte completo a dark/light mode

### Sistema de Autenticação
- JWT para sessões seguras
- Middleware de autenticação
- Validação de rotas protegidas

## 📊 Status do Projeto

### 🎉 Concluído
- ✅ Interface completa e responsiva
- ✅ Sistema de autenticação funcional
- ✅ Integração com VirusTotal
- ✅ Banco de dados PostgreSQL
- ✅ Geração de relatórios PDF
- ✅ Sistema de temas
- ✅ Histórico de verificações

### 🔄 Melhorias Futuras
- Notificações em tempo real
- API rate limiting
- Logs estruturados
- Testes automatizados
- Deploy automatizado

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se todas as dependências estão instaladas
2. Confirme se o PostgreSQL está rodando
3. Verifique se a API key do VirusTotal é válida
4. Consulte os logs do servidor para erros específicos

---

**Desenvolvido como Trabalho de Conclusão de Curso (TCC)**  
*Sistema de Verificação de Segurança - 2025*
