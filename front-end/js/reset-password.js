class ResetPasswordManager {
  constructor() {
    this.form = document.getElementById('reset-password-form');
    this.submitBtn = document.getElementById('submit-btn');
    this.loading = document.getElementById('loading');
    this.errorMessage = document.getElementById('error-message');
    this.successMessage = document.getElementById('success-message');
    this.passwordInput = document.getElementById('password');
    this.confirmPasswordInput = document.getElementById('confirmPassword');
    
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

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.passwordInput.addEventListener('input', () => this.validatePassword());
    this.confirmPasswordInput.addEventListener('input', () => this.validatePasswordMatch());
    
    // Password visibility toggles
    document.getElementById('password-toggle').addEventListener('click', () => this.togglePasswordVisibility('password'));
    document.getElementById('confirm-password-toggle').addEventListener('click', () => this.togglePasswordVisibility('confirmPassword'));
    
    this.hideMessages();
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const password = this.passwordInput.value;
    const confirmPassword = this.confirmPasswordInput.value;
    
    if (password.length < 8) {
      this.showError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (!this.isPasswordValid(password)) {
      this.showError('A senha não atende aos requisitos mínimos.');
      return;
    }

    if (password !== confirmPassword) {
      this.showError('As senhas não coincidem.');
      return;
    }

    await this.resetPassword(password);
  }

  async resetPassword(password) {
    this.setLoading(true);
    this.hideMessages();

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

      const data = await response.json();

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

  validatePassword() {
    const password = this.passwordInput.value;
    
    // Length check (8 characters)
    this.updateStrengthItem('length', password.length >= 8);
    
    // Uppercase check
    this.updateStrengthItem('upper', /[A-Z]/.test(password));
    
    // Lowercase check
    this.updateStrengthItem('lower', /[a-z]/.test(password));
    
    // Number check
    this.updateStrengthItem('number', /\d/.test(password));
    
    // Special character check
    this.updateStrengthItem('special', /[!@#$%^&*(),.?":{}|<>]/.test(password));
    
    this.validatePasswordMatch();
  }

  updateStrengthItem(type, isValid) {
    const item = this.requirements[type];
    const icon = item.querySelector('i');
    
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

  validatePasswordMatch() {
    const password = this.passwordInput.value;
    const confirmPassword = this.confirmPasswordInput.value;
    const confirmValidation = document.getElementById('confirm-validation');
    
    if (confirmPassword && password !== confirmPassword) {
      this.confirmPasswordInput.classList.add('input-error');
      confirmValidation.textContent = 'As senhas não coincidem';
      confirmValidation.style.display = 'block';
    } else {
      this.confirmPasswordInput.classList.remove('input-error');
      confirmValidation.style.display = 'none';
    }
  }

  isPasswordValid(password) {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /\d/.test(password) &&
           /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(inputId === 'password' ? 'password-toggle' : 'confirm-password-toggle');
    const icon = toggle.querySelector('i');
    
    if (input.type === 'password') {
      input.type = 'text';
      icon.className = 'fa-solid fa-eye-slash';
    } else {
      input.type = 'password';
      icon.className = 'fa-solid fa-eye';
    }
  }

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

  showError(message) {
    this.hideMessages();
    document.getElementById('error-text').textContent = message;
    this.errorMessage.style.display = 'flex';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideMessages();
    }, 5000);
  }

  showSuccess(message) {
    this.hideMessages();
    document.getElementById('success-text').textContent = message;
    this.successMessage.style.display = 'flex';
  }

  hideMessages() {
    this.errorMessage.style.display = 'none';
    this.successMessage.style.display = 'none';
  }

  showLoadingModal(message) {
    const modal = document.getElementById('loading-modal');
    const text = document.getElementById('loading-modal-text');
    text.textContent = message;
    modal.style.display = 'flex';
  }

  hideLoadingModal() {
    const modal = document.getElementById('loading-modal');
    modal.style.display = 'none';
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Garantir que o tema está aplicado no body também
  const savedTheme = localStorage.getItem('theme') || 'light-theme';
  if (!document.body.classList.contains(savedTheme)) {
    document.body.className = savedTheme;
  }

  new ResetPasswordManager();
});