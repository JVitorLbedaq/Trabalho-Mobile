const API_URL = 'http://localhost:8080/api';
const parametrosUrl = new URLSearchParams(window.location.search);
const idLojaAtual = parametrosUrl.get('id');
const roleUsuario = localStorage.getItem('market_role');
const idUsuarioLogado = localStorage.getItem('market_usuario_id');

async function carregarDadosLoja() {
    try {
        const respostaLoja = await fetch(`${API_URL}/lojas/${idLojaAtual}`);
        if (!respostaLoja.ok) {
            window.location.href = 'index.html';
            return;
        }
        
        const loja = await respostaLoja.json();
        document.getElementById('nome-loja').innerText = loja.nome;

        if (roleUsuario === 'ROLE_ADMIN' && String(loja.vendedorId) === String(idUsuarioLogado)) {
            document.getElementById('btn-editar-loja').style.display = 'block';
        }

        const respostaProdutos = await fetch(`${API_URL}/produtos`);
        const todosProdutos = await respostaProdutos.json();
        const produtosDaLoja = todosProdutos.filter(p => String(p.lojaId) === String(idLojaAtual));
        
        renderizarVitrineLoja(produtosDaLoja);
    } catch (erro) {
        window.location.href = 'index.html';
    }
}

function renderizarVitrineLoja(produtos) {
    const container = document.getElementById('vitrine-loja');
    container.innerHTML = '';
    
    produtos.forEach(produto => {
        if (!produto.disponivel) return;

        const article = document.createElement('article');
        article.className = 'card-produto';
        article.innerHTML = `
            <h3>${produto.titulo}</h3>
            <img src="${produto.imagemBase64}" alt="${produto.titulo}" class="imagem-produto">
            <div class="card-info">
                <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
                <p class="descricao-produto">${produto.descricao}</p>
            </div>
            <!-- MUDAMOS AQUI: Agora ele salva no carrinho -->
            <button onclick="adicionarAoCarrinho(${produto.id}, '${produto.titulo}', ${produto.preco}, ${produto.lojaId}, '${produto.imagemBase64}')" class="btn-laranja">+</button>
        `;
        container.appendChild(article);
    });
}

function adicionarAoCarrinho(id, titulo, preco, lojaId, imagem) {
    const token = localStorage.getItem('market_token');
    if (!token) {
        mostrarMensagem("Você precisa estar logado para pedir", "erro");
        return; 
    }

    let carrinho = JSON.parse(localStorage.getItem('market_carrinho')) || [];
    
    if (carrinho.length > 0 && String(carrinho[0].lojaId) !== String(lojaId)) {
        mostrarConfirmacao(
            "Lojas Diferentes",
            "Seu carrinho contém produtos de outra loja. Deseja esvaziar o carrinho atual e adicionar este novo produto?",
            "Sim, Esvaziar e Adicionar",
            () => {
                carrinho = []; 
                processarAdicaoItem(carrinho, id, titulo, preco, lojaId, imagem);
            }
        );
    } else {
        processarAdicaoItem(carrinho, id, titulo, preco, lojaId, imagem);
    }
}

function processarAdicaoItem(carrinho, id, titulo, preco, lojaId, imagem) {
    let itemExistente = carrinho.find(item => item.id === id);
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({ id, titulo, preco, lojaId, imagem, quantidade: 1 });
    }
    
    localStorage.setItem('market_carrinho', JSON.stringify(carrinho));
    mostrarMensagem(`${titulo} adicionado ao carrinho!`);
}

function enviarWhatsApp(tituloProduto, preco) {
    const numeroLoja = "5511999999999"; 
    const mensagem = `Olá! Gostaria de encomendar o produto: *${tituloProduto}* (R$ ${preco.toFixed(2)}).`;
    const url = `https://wa.me/${numeroLoja}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

document.getElementById('btn-editar-loja').addEventListener('click', () => {
    window.location.href = `gerenciarLoja.html?id=${idLojaAtual}`;
});

if (idLojaAtual) {
    carregarDadosLoja();
} else {
    window.location.href = 'index.html';
}