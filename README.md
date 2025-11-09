# NO MATTERS - Análise de Segurança

Protótipo de um site para a verificação de arquivos e urls maliciosas

## Requisitos do Sistema

### Pré-requisitos
- **Node.js** (versão 18.0 ou superior)
- **PostgreSQL** (versão 12.0 ou superior)
- **npm** (incluído com Node.js)
- **Git** (para clonagem do repositório)

### Conta Externa Necessária
- **VirusTotal API Key** (gratuita) - necessária para análise de arquivos e URLs

## Instalação

### 1. Clonagem do Repositório
```bash
git clone https://github.com/carlosed-m/TCC---II.git
cd TCC---II
```

### 2. Configuração do Banco de Dados

#### 2.1. Instalar PostgreSQL
- Baixe e instale o PostgreSQL em: https://www.postgresql.org/download/
- Durante a instalação, defina uma senha para o usuário `postgres`

#### 2.2. Criar Banco de Dados
Execute os comandos no psql ou pgAdmin:
```sql
CREATE DATABASE "TccII";
CREATE USER tcc_user WITH PASSWORD 'tcc123';
GRANT ALL PRIVILEGES ON DATABASE "TccII" TO tcc_user;
```

#### 2.3. Criar Tabelas
Execute o script SQL localizado em `back-end/banco-e-rotas/database/create_tables.sql`:
```sql
-- Conecte-se ao banco TccII e execute:
Execute o código que está nos arquivos create_tables.sql e add_password_reset.sql. Caso apareça a mensagem que foi realizado com sucesso, pode estar fechando o pgAdmin
```

### 3. Configuração do Back-End

#### 3.1. Criar arquivo de Variáveis de Ambiente (.env)

Crie um arquivo chamado `.env` dentro da pasta `back-end/banco-e-rotas/` com o seguinte conteúdo:

```env
# Configurações do Banco de Dados
DB_USER=tcc_user
DB_HOST=localhost
DB_NAME=TccII
DB_PASSWORD=tcc123
DB_PORT=5432

# JWT Secret (Chave secreta para autenticação)
JWT_SECRET=sua_chave_secreta_aqui

# Porta da aplicação
PORT=3001

# API do VirusTotal
VT_API_KEY=sua_chave_virustotal_aqui
```

**📝 Instruções para cada variável:**

- **DB_USER**: Usuário do PostgreSQL (padrão: `tcc_user`)
- **DB_HOST**: Endereço do servidor PostgreSQL (padrão: `localhost`)
- **DB_NAME**: Nome do banco de dados (padrão: `TccII`)
- **DB_PASSWORD**: Senha definida na criação do usuário (padrão: `tcc123`)
- **DB_PORT**: Porta do PostgreSQL (padrão: `5432`)
- **JWT_SECRET**: Chave secreta para tokens de autenticação (veja instruções abaixo)
- **PORT**: Porta onde o servidor back-end vai rodar (padrão: `3001`)
- **VT_API_KEY**: Chave da API do VirusTotal (obtenha em https://www.virustotal.com/gui/my-apikey)

#### 3.2. Como gerar o JWT_SECRET

O `JWT_SECRET` é uma chave secreta usada para assinar tokens de autenticação. **NUNCA compartilhe esta chave!**

**Opção 1: Usando Node.js (Recomendado)**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Opção 2: Usando OpenSSL**
```bash
openssl rand -hex 64
```

**Opção 3: Online**
- Acesse: https://randomkeygen.com/
- Use a opção "CodeIgniter Encryption Keys" ou "Fort Knox Passwords"

**Exemplo de JWT_SECRET válido:**
```
7f4dfa6107162a9b74ec56020058df5cd7ffbeb2d9f88e800cdaf090b7aaf86bb81ec3e85f72180e815a2d9820043991949480a012f1a266d82796580423d34d
```

⚠️ **IMPORTANTE:**
- Mínimo recomendado: 64 caracteres hexadecimais
- **NUNCA** commite o arquivo `.env` no Git (já está no `.gitignore`)
- Use chaves diferentes para desenvolvimento e produção

#### 3.3. Como obter a chave do VirusTotal (VT_API_KEY)

1. Acesse: https://www.virustotal.com/
2. Crie uma conta gratuita (se não tiver)
3. Faça login e vá para: https://www.virustotal.com/gui/my-apikey
4. Copie sua API Key
5. Cole no arquivo `.env` na variável `VT_API_KEY`

**Limites da conta gratuita:**
- 4 requisições por minuto
- 500 requisições por dia
- Suficiente para desenvolvimento e testes

#### 3.4. Instalar Dependências
```bash
cd back-end/banco-e-rotas
npm install
```

### 4. Configuração do Front-End

#### 4.1. Instalar Dependências
```bash
cd front-end
npm install
```

#### 4.2. Instalar Servidor Local (Live Server) (Opcional)
```bash
# Instalar globalmente
npm install -g live-server

# Ou usar uma extensão do VS Code: Live Server
```

## Execução

### 1. Iniciar o Back-End
```bash
npm run start:api

```
O servidor estará disponível em: http://localhost:3001

### 2. Iniciar o Front-End
```bash
npm start
```
A aplicação estará disponível em: http://localhost:3000

### Portas em Uso
- Back-end (3001): Altere a variável `PORT` no `.env`
- Front-end (3000): Use `live-server --port=XXXX`


## Licença

Este projeto está sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.
