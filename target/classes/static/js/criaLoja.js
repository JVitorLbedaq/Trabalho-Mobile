const API_URL = 'http://localhost:8080/api';

document.getElementById('form-criar-loja').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const nomeLoja = document.getElementById('nome-loja').value;
    const token = localStorage.getItem('market_token');
    const vendedorId = localStorage.getItem('market_usuario_id');

    const novaLoja = {
        nome: nomeLoja,
        vendedorId: parseInt(vendedorId)
    };

    try {
        const resposta = await fetch(`${API_URL}/lojas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(novaLoja)
        });

        if (resposta.ok) {
            window.location.href = 'painel.html';
        } else {
            mostrarMensagem('Erro ao criar a loja.','erro');
        }
    } catch (erro) {
        mostrarMensagem('Erro de conexão com o servidor.','erro');
    }
});