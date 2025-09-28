# API Documentation - TCC Backend

## Configuração Inicial

### 1. Instalar Dependências
```bash
cd back-end/banco-e-rotas
npm install
```

### 2. Configurar Banco PostgreSQL
1. Abra o pgAdmin
2. Crie um banco chamado `tcc_database`
3. Execute o script `database/create_tables.sql`

### 3. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

### 4. Iniciar Servidor
```bash
npm run dev  # Para desenvolvimento
# ou
npm start   # Para produção
```

## Rotas da API

### 🔐 Autenticação (`/api/auth`)

#### Registrar Usuário
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "123456"
}
```
- **Resposta:**
```json
{
  "success": true,
  "message": "Usuário cadastrado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

#### Login
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "joao@email.com",
  "password": "123456"
}
```

#### Verificar Token
- **GET** `/api/auth/verify`
- **Headers:** `Authorization: Bearer TOKEN`

#### Logout
- **POST** `/api/auth/logout`
- **Headers:** `Authorization: Bearer TOKEN`

### 👤 Usuários (`/api/users`)

#### Obter Perfil
- **GET** `/api/users/profile`
- **Headers:** `Authorization: Bearer TOKEN`

#### Atualizar Perfil
- **PUT** `/api/users/profile`
- **Headers:** `Authorization: Bearer TOKEN`
- **Body:**
```json
{
  "name": "João Santos",
  "email": "joao.santos@email.com"
}
```

#### Alterar Senha
- **PUT** `/api/users/change-password`
- **Headers:** `Authorization: Bearer TOKEN`
- **Body:**
```json
{
  "currentPassword": "123456",
  "newPassword": "novaSenha123"
}
```

#### Deletar Conta
- **DELETE** `/api/users/account`
- **Headers:** `Authorization: Bearer TOKEN`
- **Body:**
```json
{
  "password": "123456"
}
```

### 📊 Histórico (`/api/history`)

#### Salvar Verificação
- **POST** `/api/history`
- **Headers:** `Authorization: Bearer TOKEN`
- **Body:**
```json
{
  "type": "url",
  "target": "https://example.com",
  "result": {...},
  "status": "clean",
  "threat_count": 0
}
```

#### Obter Histórico
- **GET** `/api/history?page=1&limit=10&type=url`
- **Headers:** `Authorization: Bearer TOKEN`

#### Detalhes de Verificação
- **GET** `/api/history/:id`
- **Headers:** `Authorization: Bearer TOKEN`

#### Deletar Verificação
- **DELETE** `/api/history/:id`
- **Headers:** `Authorization: Bearer TOKEN`

#### Estatísticas do Usuário
- **GET** `/api/history/stats/user`
- **Headers:** `Authorization: Bearer TOKEN`

## Status da API

### Verificar Status
- **GET** `/api/status`
- **Resposta:**
```json
{
  "success": true,
  "message": "API do TCC funcionando corretamente",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

## Códigos de Erro

- `400` - Bad Request (dados inválidos)
- `401` - Unauthorized (token inválido/expirado)
- `403` - Forbidden (sem permissão)
- `404` - Not Found (recurso não encontrado)
- `500` - Internal Server Error (erro do servidor)

## Formato de Erro Padrão
```json
{
  "erro": "Título do erro",
  "detalhe": "Descrição detalhada do erro"
}
```

## Integração com Frontend

### Exemplo de uso com fetch:

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.token);
  }
  return data;
};

// Fazer requisição autenticada
const getProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3001/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  return response.json();
};
```