const API_URL = 'http://localhost:8080/api';
const token = localStorage.getItem('market_token');
const idUsuarioLogado = localStorage.getItem('market_usuario_id');
let idLojaAtual = null;

if (!token || localStorage.getItem('market_role') !== 'ROLE_ADMIN') {
    window.location.href = 'index.html';
}

// A lógica do botão 'Sair' foi removida daqui, pois o navbar.js já faz isso!

async function carregarLojaDoVendedor() {
    try {
        const resposta = await fetch(`${API_URL}/lojas/vendedor/${idUsuarioLogado}`, {
            headers: { 'Authorization': token }
        });
        
        if (resposta.ok) {
            const lojas = await resposta.json();
            if (lojas.length > 0) {
                idLojaAtual = lojas[0].id;
            } else {
                window.location.href = 'criaLoja.html';
            }
        }
    } catch (erro) {
        window.location.href = 'index.html';
    }
}

function converterParaBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

document.getElementById('form-produto').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    if (!idLojaAtual) {
        mostrarMensagem('Erro: Nenhuma loja associada a este usuário.','erro');
        return;
    }

    const titulo = document.getElementById('titulo').value;
    const categoria = document.getElementById('categoria').value;
    const preco = parseFloat(document.getElementById('preco').value);
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const descricao = document.getElementById('descricao').value;
    const fotoInput = document.getElementById('foto').files[0];

    try {
        let imagemBase64 = "";
        if (fotoInput) {
            imagemBase64 = await converterParaBase64(fotoInput);
        }

        const produto = {
            titulo: titulo,
            descricao: descricao,
            preco: preco,
            categoria: categoria,
            imagemBase64: imagemBase64,
            quantidadeDisponivel: quantidade,
            lojaId: idLojaAtual
        };

        const resposta = await fetch(`${API_URL}/produtos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(produto)
        });

        if (resposta.ok) {
            mostrarMensagem('Produto cadastrado com sucesso!');
            document.getElementById('form-produto').reset();
        } else if (resposta.status === 401) {
            window.location.href = 'login.html';
        } else {
            mostrarMensagem('Erro ao cadastrar o produto.','erro');
        }

    } catch (erro) {
        mostrarMensagem('Erro de conexão com o servidor.','erro');
    }
});

carregarLojaDoVendedor();