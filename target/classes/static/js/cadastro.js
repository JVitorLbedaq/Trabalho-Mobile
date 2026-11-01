const API_URL = 'http://localhost:8080/api';

const inputCelular = document.getElementById('celular');
if (typeof aplicarMascaraCelular === 'function') {
    aplicarMascaraCelular(inputCelular);
}

document.getElementById('form-cadastro').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const nome = document.getElementById('nome').value;
    const celular = prepararCelularParaAPI(document.getElementById('celular').value);
    const senha = document.getElementById('senha').value;
    const role = document.getElementById('tipo-conta').value;

    const novoUsuario = {
        nome: nome,
        celular: celular,
        senha: senha,
        role: role
    };

    try {
        const resposta = await fetch(`${API_URL}/usuarios/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoUsuario)
        });

        if (resposta.ok) {
            const usuarioSalvo = await resposta.json();
            
            const token = btoa(`${celular}:${senha}`);
            localStorage.setItem('market_token', `Basic ${token}`);
            localStorage.setItem('market_role', role);
            localStorage.setItem('market_usuario_id', usuarioSalvo.id);
            localStorage.setItem('market_usuario_celular', celular);

            if (role === 'ROLE_ADMIN') {
                window.location.href = 'criaLoja.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            const erro = await resposta.text();
            mostrarMensagem(erro || 'Erro ao realizar o cadastro.','erro');
        }
    } catch (erro) {
        mostrarMensagem("Erro de conexão com o servidor.",'erro');
    }
});