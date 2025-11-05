# NO MATTERS - Sistema de Análise de Segurança

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
\i back-end/banco-e-rotas/database/create_tables.sql
```

### 3. Configuração do Back-End

#### 3.1. Instalar Dependências
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

#### 4.2. Instalar Servidor Local (Live Server)
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
