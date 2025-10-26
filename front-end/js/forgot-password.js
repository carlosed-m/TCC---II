// Gerencia o formulário de "Esqueci minha senha"
class ForgotPasswordManager {
  constructor() {
    this.form = document.getElementById('forgot-password-form');
    this.submitBtn = document.getElementById('submit-btn');
    this.loading = document.getElementById('loading');
    this.errorMessage = document.getElementById('error-message');
    this.successMessage = document.getElementById('success-message');
    this.emailInput = document.getElementById('email');
    
    this.init();
  }
  // Inicializa os eventos do formulário
  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.hideMessages();
  }
  // Manipula o envio do formulário
  async handleSubmit(e) {
    e.preventDefault();
    // Validar e-mail
    const email = this.emailInput.value.trim();
    // Verificar se o campo não está vazio
    if (!email) {
      this.showError('Por favor, digite um e-mail válido.');
      return;
    }
    // Verificar formato do e-mail
    if (!this.isValidEmail(email)) {
      this.showError('Por favor, digite um e-mail válido.');
      return;
    }
    // Enviar solicitação de redefinição de senha
    await this.sendPasswordReset(email);
  }
  // Envia a solicitação de redefinição de senha para o backend
  async sendPasswordReset(email) {
    this.setLoading(true);
    this.hideMessages();
    // Enviar requisição ao backend
    try {
      const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      // Verificar resposta do servidor
      if (response.ok) {
        this.showSuccess(`E-mail verificado! Olá, ${data.userName}!`);
        
        // Salvar código no localStorage temporariamente
        localStorage.setItem('resetCode', data.resetCode);
        localStorage.setItem('resetUserName', data.userName);
        
        // Mostrar modal de carregamento antes de redirecionar
        setTimeout(() => {
          this.hideMessages();
          this.showLoadingModal('Carregando...');
        }, 1500);
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          window.location.href = 'reset-password.html';
        }, 2000);
        
      } else {
        this.showError(data.message || 'Erro ao verificar e-mail. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao verificar e-mail:', error);
      this.showError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      this.setLoading(false);
    }
  }
  // Valida o formato do e-mail
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  // Controla o estado de carregamento do formulário
  setLoading(isLoading) {
    if (isLoading) {
      this.submitBtn.style.display = 'none';
      this.loading.style.display = 'flex';
      this.emailInput.disabled = true;
    } else {
      this.submitBtn.style.display = 'block';
      this.loading.style.display = 'none';
      this.emailInput.disabled = false;
    }
  }
  // Exibe mensagem de erro
  showError(message) {
    this.hideMessages();
    document.getElementById('error-text').textContent = message;
    this.errorMessage.style.display = 'flex';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideMessages();
    }, 5000);
  }
  // Exibe mensagem de sucesso
  showSuccess(message) {
    this.hideMessages();
    document.getElementById('success-text').textContent = message;
    this.successMessage.style.display = 'flex';
  }

  hideMessages() {
    this.errorMessage.style.display = 'none';
    this.successMessage.style.display = 'none';
  }
  // Exibe modal de carregamento
  showLoadingModal(message) {
    const modal = document.getElementById('loading-modal');
    const text = document.getElementById('loading-modal-text');
    text.textContent = message;
    modal.style.display = 'flex';
  }
  // Esconde modal de carregamento
  hideLoadingModal() {
    const modal = document.getElementById('loading-modal');
    modal.style.display = 'none';
  }
}

// Inicializa o gerenciador quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  // Garantir que o tema está aplicado no body também
  const savedTheme = localStorage.getItem('theme') || 'light-theme';
  if (!document.body.classList.contains(savedTheme)) {
    document.body.className = savedTheme;
  }

  new ForgotPasswordManager();
});