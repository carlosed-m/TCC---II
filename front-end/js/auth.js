// Configuração da API
const API_URL = 'http://localhost:3001/api';

// Funções de autenticação compartilhadas
class AuthManager {
  // Verificar se já está logado e redirecionar se necessário
  static checkIfLoggedIn() {
    if (localStorage.getItem('authToken')) {
      window.location.href = 'index.html';
    }
  }

  // Aplicar tema de forma suave
  static applyTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light-theme';
    // Aplicar simultaneamente ao documentElement e body
    document.documentElement.className = currentTheme;
    document.body.className = currentTheme;
    document.documentElement.style.colorScheme = currentTheme === 'dark-theme' ? 'dark' : 'light';
  }

  // Funções de UI
  static showError(errorElement, errorTextElement, message) {
    errorTextElement.textContent = message;
    errorElement.style.display = 'block';
  }

  static hideError(errorElement) {
    errorElement.style.display = 'none';
  }

  static showLoading(submitBtn, loadingElement) {
    submitBtn.disabled = true;
    loadingElement.style.display = 'block';
    submitBtn.textContent = '';
  }

  static hideLoading(submitBtn, loadingElement, buttonText) {
    loadingElement.style.display = 'none';
    submitBtn.textContent = buttonText;
    submitBtn.disabled = false;
  }
}

// Funções específicas do login
class LoginForm {
  constructor() {
    this.form = document.getElementById('login-form');
    this.submitBtn = document.getElementById('submit-btn');
    this.loading = document.getElementById('loading');
    this.errorMessage = document.getElementById('error-message');
    this.errorText = document.getElementById('error-text');
    
    this.init();
  }

  init() {
    // Verificar se já está logado
    AuthManager.checkIfLoggedIn();
    
    // Aplicar tema
    AuthManager.applyTheme();
    
    // Event listeners
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    document.getElementById('forgot-password-link').addEventListener('click', this.handleForgotPassword);
  }

  async handleSubmit(e) {
    e.preventDefault();
    AuthManager.hideError(this.errorMessage);
    AuthManager.showLoading(this.submitBtn, this.loading);

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // Salvar token no localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));

        // Redirecionar para a página principal
        window.location.href = 'index.html';
      } else {
        AuthManager.showError(this.errorMessage, this.errorText, data.detalhe || data.erro || 'Erro ao fazer login');
      }
    } catch (error) {
      AuthManager.showError(this.errorMessage, this.errorText, 'Erro de conexão. Verifique sua internet e tente novamente.');
      // Erro de login - exibe mensagem de erro
    } finally {
      AuthManager.hideLoading(this.submitBtn, this.loading, 'Entrar');
    }
  }

  handleForgotPassword(e) {
    e.preventDefault();
    alert('Funcionalidade de recuperação de senha em desenvolvimento!');
  }
}

// Funções específicas do cadastro
class RegisterForm {
  constructor() {
    this.form = document.getElementById('signup-form');
    this.submitBtn = document.getElementById('submit-btn');
    this.loading = document.getElementById('loading');
    this.errorMessage = document.getElementById('error-message');
    this.errorText = document.getElementById('error-text');
    this.successModal = document.getElementById('success-modal');
    this.modalOkBtn = document.getElementById('modal-ok-btn');

    // Elementos de validação
    this.nameInput = document.getElementById('name');
    this.emailInput = document.getElementById('email');
    this.passwordInput = document.getElementById('password');
    this.confirmPasswordInput = document.getElementById('confirmPassword');
    
    this.init();
  }

  init() {
    // Verificar se já está logado
    AuthManager.checkIfLoggedIn();
    
    // Aplicar tema
    AuthManager.applyTheme();
    
    // Event listeners
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    this.modalOkBtn.addEventListener('click', this.handleModalOk);
    
    // Validações
    this.nameInput.addEventListener('input', this.validateName.bind(this));
    this.emailInput.addEventListener('input', this.validateEmail.bind(this));
    this.passwordInput.addEventListener('input', this.validatePassword.bind(this));
    this.confirmPasswordInput.addEventListener('input', this.validatePasswordConfirmation.bind(this));
  }

  validateName() {
    const name = this.nameInput.value;
    const nameValidation = document.getElementById('name-validation');
    const nameRegex = /^[a-zA-Z0-9À-ÿ\s]+$/;
    
    if (name && !nameRegex.test(name)) {
      this.nameInput.classList.add('invalid');
      this.nameInput.classList.remove('valid');
      nameValidation.textContent = 'Use apenas letras e números';
      nameValidation.style.display = 'block';
    } else if (name.length >= 2) {
      this.nameInput.classList.add('valid');
      this.nameInput.classList.remove('invalid');
      nameValidation.style.display = 'none';
    } else {
      this.nameInput.classList.remove('valid', 'invalid');
      nameValidation.style.display = 'none';
    }
    
    this.checkFormValidity();
  }

  validateEmail() {
    const email = this.emailInput.value;
    const emailValidation = document.getElementById('email-validation');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
      this.emailInput.classList.add('invalid');
      this.emailInput.classList.remove('valid');
      emailValidation.textContent = 'E-mail inválido';
      emailValidation.style.display = 'block';
    } else if (email) {
      this.emailInput.classList.add('valid');
      this.emailInput.classList.remove('invalid');
      emailValidation.style.display = 'none';
    } else {
      this.emailInput.classList.remove('valid', 'invalid');
      emailValidation.style.display = 'none';
    }
    
    this.checkFormValidity();
  }

  validatePassword() {
    const password = this.passwordInput.value;
    
    // Verificar critérios
    const lengthCheck = password.length >= 8;
    const uppercaseCheck = /[A-Z]/.test(password);
    const lowercaseCheck = /[a-z]/.test(password);
    const numberCheck = /\d/.test(password);
    const specialCheck = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password);

    // Atualizar indicadores visuais
    this.updateStrengthIndicator('length-check', lengthCheck);
    this.updateStrengthIndicator('uppercase-check', uppercaseCheck);
    this.updateStrengthIndicator('lowercase-check', lowercaseCheck);
    this.updateStrengthIndicator('number-check', numberCheck);
    this.updateStrengthIndicator('special-check', specialCheck);

    // Validação geral da senha
    if (lengthCheck && uppercaseCheck && lowercaseCheck && numberCheck && specialCheck) {
      this.passwordInput.classList.add('valid');
      this.passwordInput.classList.remove('invalid');
    } else if (password) {
      this.passwordInput.classList.add('invalid');
      this.passwordInput.classList.remove('valid');
    } else {
      this.passwordInput.classList.remove('valid', 'invalid');
    }

    // Validar confirmação se já foi preenchida
    if (this.confirmPasswordInput.value) {
      this.validatePasswordConfirmation();
    }
    
    this.checkFormValidity();
  }

  validatePasswordConfirmation() {
    const password = this.passwordInput.value;
    const confirmPassword = this.confirmPasswordInput.value;
    const confirmValidation = document.getElementById('confirm-validation');
    
    if (confirmPassword && password !== confirmPassword) {
      this.confirmPasswordInput.classList.add('invalid');
      this.confirmPasswordInput.classList.remove('valid');
      confirmValidation.textContent = 'As senhas não coincidem';
      confirmValidation.style.display = 'block';
    } else if (confirmPassword && password === confirmPassword) {
      this.confirmPasswordInput.classList.add('valid');
      this.confirmPasswordInput.classList.remove('invalid');
      confirmValidation.style.display = 'none';
    } else {
      this.confirmPasswordInput.classList.remove('valid', 'invalid');
      confirmValidation.style.display = 'none';
    }
    
    this.checkFormValidity();
  }

  updateStrengthIndicator(elementId, isValid) {
    const element = document.getElementById(elementId);
    const icon = element.querySelector('i');
    
    if (isValid) {
      element.classList.add('valid');
      element.classList.remove('invalid');
      icon.className = 'fa-solid fa-check';
    } else {
      element.classList.add('invalid');
      element.classList.remove('valid');
      icon.className = 'fa-solid fa-times';
    }
  }

  checkFormValidity() {
    const nameValid = this.nameInput.classList.contains('valid') && this.nameInput.value.length >= 2;
    const emailValid = this.emailInput.classList.contains('valid');
    const passwordValid = this.passwordInput.classList.contains('valid');
    const confirmValid = this.confirmPasswordInput.classList.contains('valid');
    
    this.submitBtn.disabled = !(nameValid && emailValid && passwordValid && confirmValid);
  }

  showSuccessModal() {
    this.successModal.style.display = 'block';
  }

  async handleSubmit(e) {
    e.preventDefault();
    AuthManager.hideError(this.errorMessage);
    AuthManager.showLoading(this.submitBtn, this.loading);

    const name = this.nameInput.value;
    const email = this.emailInput.value;
    const password = this.passwordInput.value;

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (data.success) {
        this.showSuccessModal();
      } else {
        AuthManager.showError(this.errorMessage, this.errorText, data.detalhe || data.erro || 'Erro ao criar conta');
      }
    } catch (error) {
      AuthManager.showError(this.errorMessage, this.errorText, 'Erro de conexão. Verifique sua internet e tente novamente.');
      // Erro de cadastro - exibe mensagem de erro
    } finally {
      AuthManager.hideLoading(this.submitBtn, this.loading, 'Criar Conta');
    }
  }

  handleModalOk() {
    window.location.href = 'login.html';
  }
}

// Inicializar baseado na página atual
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('login-form')) {
    new LoginForm();
  } else if (document.getElementById('signup-form')) {
    new RegisterForm();
  }
});