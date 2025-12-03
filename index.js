document.addEventListener('DOMContentLoaded', () => {
    // Selecionando elementos do DOM
    const authForm = document.getElementById('auth-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submit-btn');
    const errorMsg = document.getElementById('error-message');
    const formTitle = document.getElementById('form-title');

    // Elementos de alternância (Login vs Cadastro)
    const toggleMode = document.getElementById('toggle-mode');
    const toggleText = document.getElementById('toggle-text');

    // Elementos do Modal de Ajuda
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeHelpBtn = document.getElementById('close-help');
    const closeHelpModalBtn = document.getElementById('close-help-btn');

    // Variável de estado para saber se estamos logando ou criando conta
    let isRegisterMode = false;

    // 1. Função para alternar entre Login e Cadastro visualmente
    toggleMode.addEventListener('change', () => {
        isRegisterMode = toggleMode.checked;

        // Limpa erros ao trocar de modo
        showError('');

        if (isRegisterMode) {
            formTitle.textContent = "Criar Conta";
            submitBtn.textContent = "Cadastrar";
            toggleText.innerHTML = "Já tem conta? <b>Entrar.</b>";
        } else {
            formTitle.textContent = "Entrar";
            submitBtn.textContent = "Entrar";
            toggleText.innerHTML = "Novo por aqui? <b>Assine agora.</b>";
        }
    });

    // 2. Função principal de envio do formulário
    authForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede a página de recarregar

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showError("Preencha todos os campos.");
            return;
        }

        if (isRegisterMode) {
            handleRegister(email, password);
        } else {
            handleLogin(email, password);
        }
    });

    // Lógica de Cadastro
    function handleRegister(email, password) {
        // Verifica se o usuário já existe no localStorage
        const existingUser = localStorage.getItem(email);

        if (existingUser) {
            showError("Este email já está cadastrado.");
            return;
        }

        // Salva o usuário
        localStorage.setItem(email, password);

        alert("Conta criada com sucesso! Agora faça login.");

        // Volta para o modo de login automaticamente
        toggleMode.checked = false;
        toggleMode.dispatchEvent(new Event('change')); // Dispara o evento visual

        // Limpa campos
        emailInput.value = '';
        passwordInput.value = '';
    }

    // Lógica de Login
    function handleLogin(email, password) {
        const storedPassword = localStorage.getItem(email);

        if (!storedPassword) {
            showError("Usuário não encontrado.");
            return;
        }

        if (storedPassword !== password) {
            showError("Senha incorreta.");
            return;
        }

        // Sucesso
        showError('');

        // 1. Salva um marcador de sessão para proteger a próxima página
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', email); // Opcional: para saber quem logou

        // 2. Redireciona para a página interna
        // Certifique-se que a pasta "public" existe e tem o "index.html" dentro
        window.location.href = "./public/index.html";
    }

    // Função utilitária para mostrar erros
    function showError(message) {
        if (message) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
        } else {
            errorMsg.style.display = 'none';
        }
    }

    // 3. Funcionalidade do Modal de Ajuda
    helpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        helpModal.classList.remove('hidden');
    });

    closeHelpBtn.addEventListener('click', () => {
        helpModal.classList.add('hidden');
    });

    closeHelpModalBtn.addEventListener('click', () => {
        helpModal.classList.add('hidden');
    });

    // Fechar modal ao clicar fora do conteúdo
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.classList.add('hidden');
        }
    });

    // Fechar modal ao pressionar ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !helpModal.classList.contains('hidden')) {
            helpModal.classList.add('hidden');
        }
    });
});