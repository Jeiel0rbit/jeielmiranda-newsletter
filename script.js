document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.form');
    const emailInput = document.querySelector('input[type="email"]');
    const button = document.querySelector('button');
    const feedbackCard = document.getElementById('feedbackCard');
    const feedbackMessage = document.getElementById('feedbackMessage');
    let db, firebase;

    // Inicialização segura
    const initFirebase = () => {
        try {
            db = window.db;
            firebase = window.firebaseModules;
            return true;
        } catch (error) {
            console.error('Erro ao inicializar Firebase:', error);
            return false;
        }
    };

    // Validação de email
    const validarEmail = (email) => {
        const regex = /^[a-zA-Z0-9._-]+@(gmail|hotmail|duck)\.com$/;
        return regex.test(email);
    };

    // Exibir feedback
    const showFeedback = (message, type = 'success') => {
        feedbackCard.className = `feedback-card ${type}`;
        feedbackMessage.textContent = message;
        feedbackCard.style.display = 'block';

        // Ocultar após 5 segundos
        setTimeout(() => {
            feedbackCard.style.display = 'none';
        }, 5000);
    };

    // Atualizar contador
    const atualizarLeitoresAtivos = async () => {
        if (!initFirebase()) return;
        
        try {
            const querySnapshot = await firebase.getDocs(firebase.collection(db, 'emails'));
            document.getElementById('leitoresAtivos').textContent = querySnapshot.size;
        } catch (error) {
            console.error('Erro ao buscar emails:', error);
            showFeedback('Erro ao carregar dados. Tente novamente.', 'error');
        }
    };

    // Handler de submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!initFirebase()) {
            showFeedback('Serviço indisponível. Tente mais tarde.', 'error');
            return;
        }

        const email = emailInput.value.trim().toLowerCase();
        button.disabled = true;
        button.textContent = 'Enviando...';

        if (!validarEmail(email)) {
            showFeedback('Domínio inválido! Use @gmail.com, @hotmail.com ou @duck.com.', 'error');
            button.disabled = false;
            button.textContent = 'Inscrever-se (Grátis)';
            return;
        }

        try {
            // Verificar duplicatas
            const q = firebase.query(
                firebase.collection(db, 'emails'),
                firebase.where('email', '==', email)
            );
            
            const snapshot = await firebase.getDocs(q);
            if (!snapshot.empty) {
                throw new Error('Email já cadastrado!');
            }

            // Cadastrar
            await firebase.addDoc(firebase.collection(db, 'emails'), { 
                email, 
                timestamp: new Date().toISOString() 
            });
            
            showFeedback('✅ Inscrição confirmada! Verifique seu email.', 'success');
            document.querySelector('.form').reset();
        } catch (error) {
            showFeedback(error.message || 'Erro ao cadastrar. Tente novamente.', 'error');
        } finally {
            button.disabled = false;
            button.textContent = 'Inscrever-se (Grátis)';
            atualizarLeitoresAtivos();
        }
    });

    // Inicialização
    atualizarLeitoresAtivos();
});
