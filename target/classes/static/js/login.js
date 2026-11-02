const API_URL = 'http://localhost:8080/api';
const inputCelular = document.getElementById('celular');

if (typeof aplicarMascaraCelular === 'function') {
    aplicarMascaraCelular(inputCelular);
}

document.getElementById('form-login').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const celular = prepararCelularParaAPI(document.getElementById('celular').value);
    const senha = document.getElementById('senha').value;

    const token = btoa(`${celular}:${senha}`);
    const authHeader = `Basic ${token}`;

    try {
        const resposta = await fetch(`${API_URL}/usuarios/me`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader
            }
        });

        if (resposta.ok) {
            const usuario = await resposta.json();
            
            localStorage.setItem('market_token', authHeader);
            localStorage.setItem('market_usuario_celular', usuario.celular);
            localStorage.setItem('market_usuario_id', usuario.id);
            localStorage.setItem('market_role', usuario.role);

            if (usuario.role === 'ROLE_ADMIN') {
                window.location.href = 'painel.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            mostrarMensagem('Credenciais inválidas!','erro');
        }
    } catch (erro) {
        mostrarMensagem('Erro de conexão com o servidor.','erro');
    }
});