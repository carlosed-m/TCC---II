// Formulário de Redefinição de Senha
class ResetPasswordManager {
  constructor() {
    this.form = document.getElementById('reset-password-form');
    this.submitBtn = document.getElementById('submit-btn');
    this.loading = document.getElementById('loading');
    this.errorMessage = document.getElementById('error-message');
    this.successMessage = document.getElementById('success-message');
    this.passwordInput = document.getElementById('password');
    this.confirmPasswordInput = document.getElementById('confirmPassword');
    // Itens de verificação de requisitos de senha
    this.requirements = {
      length: document.getElementById('length-check'),
      upper: document.getElementById('uppercase-check'),
      lower: document.getElementById('lowercase-check'),
      number: document.getElementById('number-check'),
      special: document.getElementById('special-check')
    };
    
    // Pegar código do localStorage (ao invés de URL)
    this.resetCode = localStorage.getItem('resetCode');
    this.userName = localStorage.getItem('resetUserName');
    
    this.init();
  }
  // Verifica se a sessão de recuperação é válida
  init() {
    if (!this.resetCode) {
      this.showError('Sessão de recuperação inválida. Solicite uma nova recuperação de senha.');
      this.form.style.display = 'none';
      return;
    }

    // Mostrar nome do usuário se disponível
    if (this.userName) {
      const header = document.querySelector('.auth-header h1');
      header.innerHTML = `Redefinir Senha<br><small style="font-size: 0.7em; color: var(--text-secondary);">Olá, ${this.userName}!</small>`;
    }
    // Eventos do formulário
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.passwordInput.addEventListener('input', () => this.validatePassword());
    this.confirmPasswordInput.addEventListener('input', () => this.validatePasswordMatch());
    
    // Password visibility toggles
    document.getElementById('password-toggle').addEventListener('click', () => this.togglePasswordVisibility('password'));
    document.getElementById('confirm-password-toggle').addEventListener('click', () => this.togglePasswordVisibility('confirmPassword'));
    
    this.hideMessages();
  }
  // Manipula o envio do formulário
  async handleSubmit(e) {
    e.preventDefault();
    
    const password = this.passwordInput.value;
    const confirmPassword = this.confirmPasswordInput.value;
    // Validações básicas, se a senha tem ao menos 8 caracteres
    if (password.length < 8) {
      this.showError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    // Verifica se a senha atende aos requisitos
    if (!this.isPasswordValid(password)) {
      this.showError('A senha não atende aos requisitos mínimos.');
      return;
    }
    // Verifica se as senhas coincidem
    if (password !== confirmPassword) {
      this.showError('As senhas não coincidem.');
      return;
    }
    // Chama a função de redefinição de senha
    await this.resetPassword(password);
  }
  // Envia a requisição para redefinir a senha
  async resetPassword(password) {
    this.setLoading(true);
    this.hideMessages();
    // Envia a requisição para o backend
    try {
      const response = await fetch('http://localhost:3001/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: this.resetCode,
          newPassword: password 
        })
      });
      // Analisa a resposta
      const data = await response.json();
      // Se der tudo certo, mostra o modal que deu boa e redireciona para login
      if (response.ok) {
        this.showSuccess(`Senha redefinida com sucesso, ${data.userName}!`);
        this.form.reset();
        
        // Limpar dados do localStorage
        localStorage.removeItem('resetCode');
        localStorage.removeItem('resetUserName');
        
        // Mostrar modal de carregamento antes de redirecionar
        setTimeout(() => {
          this.hideMessages();
          this.showLoadingModal('Carregando...');
        }, 2000);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 3000);
      } else {
        this.showError(data.message || 'Erro ao redefinir senha. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      this.showError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      this.setLoading(false);
    }
  }
  // Valida a senha conforme os requisitos
  validatePassword() {
    const password = this.passwordInput.value;
    
    // Tamanho mínimo da senha
    this.updateStrengthItem('length', password.length >= 8);
    
    // Verifica se contém pelo menos uma letra maiúscula
    this.updateStrengthItem('upper', /[A-Z]/.test(password));
    
    // Verifica se contém pelo menos uma letra minúscula
    this.updateStrengthItem('lower', /[a-z]/.test(password));
    
    // Verifica se contém pelo menos um número
    this.updateStrengthItem('number', /\d/.test(password));
    
    // Verifica se contém pelo menos um caracter especial
    this.updateStrengthItem('special', /[!@#$%^&*(),.?":{}|<>]/.test(password));
    // Verifica se as senhas coincidem
    this.validatePasswordMatch();
  }
  // Atualiza o item de requisito de senha
  updateStrengthItem(type, isValid) {
    const item = this.requirements[type];
    const icon = item.querySelector('i');
    // Atualiza a classe e o ícone conforme a validade
    if (isValid) {
      item.classList.remove('invalid');
      item.classList.add('valid');
      icon.className = 'fa-solid fa-check';
    } else {
      item.classList.remove('valid');
      item.classList.add('invalid');
      icon.className = 'fa-solid fa-times';
    }
  }
  // Valida se as senhas coincidem
  validatePasswordMatch() {
    const password = this.passwordInput.value;
    const confirmPassword = this.confirmPasswordInput.value;
    const confirmValidation = document.getElementById('confirm-validation');
    // Mostra mensagem de erro se as senhas não coincidirem
    if (confirmPassword && password !== confirmPassword) {
      this.confirmPasswordInput.classList.add('input-error');
      confirmValidation.textContent = 'As senhas não coincidem';
      confirmValidation.style.display = 'block';
    } else {
      this.confirmPasswordInput.classList.remove('input-error');
      confirmValidation.style.display = 'none';
    }
  }
  // Verifica se a senha atende aos requisitos
  isPasswordValid(password) {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /\d/.test(password) &&
           /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }
  // Alterna a visibilidade da senha
  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(inputId === 'password' ? 'password-toggle' : 'confirm-password-toggle');
    const icon = toggle.querySelector('i');
    // Alterna o tipo do input e o ícone
    if (input.type === 'password') {
      input.type = 'text';
      icon.className = 'fa-solid fa-eye-slash';
    } else {
      input.type = 'password';
      icon.className = 'fa-solid fa-eye';
    }
  }
  // Define o estado de carregamento do botão
  setLoading(isLoading) {
    if (isLoading) {
      this.submitBtn.style.display = 'none';
      this.loading.style.display = 'flex';
      this.passwordInput.disabled = true;
      this.confirmPasswordInput.disabled = true;
    } else {
      this.submitBtn.style.display = 'block';
      this.loading.style.display = 'none';
      this.passwordInput.disabled = false;
      this.confirmPasswordInput.disabled = false;
    }
  }
  // Mostra mensagem de erro
  showError(message) {
    this.hideMessages();
    document.getElementById('error-text').textContent = message;
    this.errorMessage.style.display = 'flex';
    
    // Esconde a mensagem após 5 segundos
    setTimeout(() => {
      this.hideMessages();
    }, 5000);
  }
  // Mostra mensagem de sucesso
  showSuccess(message) {
    this.hideMessages();
    document.getElementById('success-text').textContent = message;
    this.successMessage.style.display = 'flex';
  }
  // Esconde todas as mensagens
  hideMessages() {
    this.errorMessage.style.display = 'none';
    this.successMessage.style.display = 'none';
  }
  // Mostra modal de carregamento
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

// Inicializa o gerenciador de redefinição de senha quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  // Garantir que o tema está aplicado no body também
  const savedTheme = localStorage.getItem('theme') || 'light-theme';
  if (!document.body.classList.contains(savedTheme)) {
    document.body.className = savedTheme;
  }

  new ResetPasswordManager();
});