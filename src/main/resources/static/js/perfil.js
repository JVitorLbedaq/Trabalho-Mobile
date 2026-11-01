const API_URL_PERFIL = 'http://localhost:8080/api';
const tokenPerfil = localStorage.getItem('market_token');

if (!tokenPerfil) window.location.href = 'login.html';

document.getElementById('form-perfil').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome-perfil').value;
    const senha = document.getElementById('senha-perfil').value;

    try {
        const res = await fetch(`${API_URL_PERFIL}/usuarios/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': tokenPerfil
            },
            body: JSON.stringify({ nome: nome, senha: senha })
        });

        if (res.ok) {
            mostrarMensagem('Perfil atualizado com sucesso! Faça login novamente com a nova senha.');
            localStorage.clear();
            window.location.href = 'login.html';
        } else {
            mostrarMensagem('Erro ao atualizar perfil.','erro');
        }
    } catch (erro) {
        mostrarMensagem('Erro de conexão.','erro');
    }
});