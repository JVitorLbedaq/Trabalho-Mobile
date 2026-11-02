const API_URL = 'http://localhost:8080/api';
const token = localStorage.getItem('market_token');
const idUsuarioLogado = localStorage.getItem('market_usuario_id');
let idLojaAtual = new URLSearchParams(window.location.search).get('id');
let produtosDaLoja = [];

async function inicializarGerenciamento() {
    if (!idLojaAtual) {
        try {
            const res = await fetch(`${API_URL}/lojas/vendedor/${idUsuarioLogado}`, {
                headers: { 'Authorization': token }
            });
            if (res.ok) {
                const lojas = await res.json();
                if (lojas.length > 0) {
                    idLojaAtual = lojas[0].id;
                } else {
                    window.location.href = 'criaLoja.html';
                    return;
                }
            }
        } catch (erro) {
            window.location.href = 'index.html';
            return;
        }
    }

    document.getElementById('link-ver-loja').href = `loja.html?id=${idLojaAtual}`;
    carregarDadosDaLoja();
    carregarProdutosDaLoja();
}

async function carregarDadosDaLoja() {
    try {
        const resposta = await fetch(`${API_URL}/lojas/${idLojaAtual}`);
        if (resposta.ok) {
            const loja = await resposta.json();
            document.getElementById('nome-loja-gerenciamento').innerText = `Gerenciando: ${loja.nome}`;
        }
    } catch (erro) {
        console.error(erro);
    }
}

async function carregarProdutosDaLoja() {
    try {
        const resposta = await fetch(`${API_URL}/produtos`);
        if (resposta.ok) {
            const todosProdutos = await resposta.json();
            const meusProdutos = todosProdutos.filter(p => String(p.lojaId) === String(idLojaAtual));
            
            renderizarProdutosGerenciamento(meusProdutos);
        }
    } catch (erro) {
        console.error('Erro ao carregar produtos', erro);
    }
}

function renderizarProdutosGerenciamento(produtos) {
    produtosDaLoja = produtos; 
    const container = document.getElementById('lista-produtos-gerenciamento');
    container.innerHTML = '';

    produtos.forEach(produto => {
        const article = document.createElement('article');
        article.className = 'card-produto';
        article.innerHTML = `
            <h3>${produto.titulo}</h3>
            <img src="${produto.imagemBase64}" class="imagem-produto">
            <div class="card-info">
                <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
                <p>Estoque: ${produto.quantidadeDisponivel}</p>
            </div>
            <div class="acoes-gerenciamento" style="display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem;">
                <button onclick="abrirModalEdicao(${produto.id})" class="btn-secundario">Editar</button>
                <button onclick="excluirProduto(${produto.id})" class="btn-perigo">Excluir</button>
            </div>
        `;
        container.appendChild(article);
    });
}

function abrirModalEdicao(id) {
    const produto = produtosDaLoja.find(p => p.id === id);
    if (!produto) return;
    
    document.getElementById('edit-id').value = produto.id;
    document.getElementById('edit-titulo').value = produto.titulo;
    document.getElementById('edit-categoria').value = produto.categoria;
    document.getElementById('edit-preco').value = produto.preco;
    document.getElementById('edit-quantidade').value = produto.quantidadeDisponivel;
    document.getElementById('edit-descricao').value = produto.descricao;
    document.getElementById('edit-foto').value = '';
    
    document.getElementById('modal-editar-produto').style.display = 'flex';
}

function converterParaBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function fecharModalEdicao() {
    document.getElementById('modal-editar-produto').style.display = 'none';
}

async function alternarDisponibilidade(idProduto, statusAtual) {
    try {
        const respostaProduto = await fetch(`${API_URL}/produtos/${idProduto}`);
        if (respostaProduto.ok) {
            const produto = await respostaProduto.json();
            produto.disponivel = !statusAtual;

            const respostaAtualizacao = await fetch(`${API_URL}/produtos/${idProduto}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(produto)
            });

            if (respostaAtualizacao.ok) {
                carregarProdutosDaLoja();
            }
        }
    } catch (erro) {
        console.error(erro);
    }
}


document.getElementById('btn-renomear-loja').addEventListener('click', async () => {
    const novoNome = document.getElementById('novo-nome-loja').value;
    if (!novoNome) {
        mostrarMensagem('Digite o novo nome da loja.');
        return;
    }
    try {
        const res = await fetch(`${API_URL}/lojas/${idLojaAtual}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ nome: novoNome })
        });
        if (res.ok) {
            mostrarMensagem('Loja renomeada com sucesso!');
            window.location.reload();
        }
    } catch (e) {
        mostrarMensagem('Erro ao renomear.','erro');
    }
});

document.getElementById('form-editar-produto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const fotoInput = document.getElementById('edit-foto').files[0];
    
    let imagemBase64 = "";
    if (fotoInput) {
        imagemBase64 = await converterParaBase64(fotoInput);
    }

    const produtoAtualizado = {
        titulo: document.getElementById('edit-titulo').value,
        categoria: document.getElementById('edit-categoria').value,
        preco: parseFloat(document.getElementById('edit-preco').value),
        quantidadeDisponivel: parseInt(document.getElementById('edit-quantidade').value),
        descricao: document.getElementById('edit-descricao').value,
        imagemBase64: imagemBase64
    };

    try {
        const res = await fetch(`${API_URL}/produtos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(produtoAtualizado)
        });

        if (res.ok) {
            mostrarMensagem('Produto atualizado com sucesso!');
            fecharModalEdicao();
            window.location.reload(); 
        } else {
            mostrarMensagem('Erro ao atualizar produto.','erro');
        }
    } catch(erro) {
        mostrarMensagem('Erro na requisição.','erro');
    }
});

function excluirProduto(idProduto) {
    mostrarConfirmacao(
        "Confirmar Exclusão",
        "Tem certeza que deseja apagar este produto? Esta ação não pode ser desfeita.",
        "Sim, Excluir",
        async () => {
            try {
                const resposta = await fetch(`${API_URL}/produtos/${idProduto}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': token }
                });
                if (resposta.ok) {
                    mostrarMensagem('Produto excluído com sucesso!');
                    carregarProdutosDaLoja(); 
                } else {
                    mostrarMensagem('Erro ao excluir o produto.', 'erro');
                }
            } catch(e) {
                mostrarMensagem('Erro de conexão.', 'erro');
            }
        }
    );
}




inicializarGerenciamento();