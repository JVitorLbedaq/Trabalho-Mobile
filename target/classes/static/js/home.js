const API_URL = 'http://localhost:8080/api';
let todosProdutos = [];
let todasLojas = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [resProd, resLojas] = await Promise.all([
            fetch(`${API_URL}/produtos`),
            fetch(`${API_URL}/lojas`)
        ]);

        todosProdutos = await resProd.json();
        todasLojas = await resLojas.json();
        
        renderizarVitrinesAgrupadas(todosProdutos);
    } catch (e) {
        console.error("Erro ao carregar os dados da Home:", e);
    }
});

document.getElementById('filtro-categoria').addEventListener('change', filtrarVitrine);
document.getElementById('btn-buscar').addEventListener('click', filtrarVitrine);
document.getElementById('campo-busca').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') filtrarVitrine();
});

function filtrarVitrine() {
    const categoria = document.getElementById('filtro-categoria').value;
    const termoBusca = document.getElementById('campo-busca').value.toLowerCase();

    const filtrados = todosProdutos.filter(p => {
        const passaCategoria = categoria === "" || p.categoria === categoria;
        const passaBusca = termoBusca === "" || p.titulo.toLowerCase().includes(termoBusca);
        return passaCategoria && passaBusca;
    });

    renderizarVitrinesAgrupadas(filtrados);
}

function renderizarVitrinesAgrupadas(produtos) {
    const container = document.getElementById('vitrine-lojas');
    container.innerHTML = '';

    if (produtos.length === 0) {
        container.innerHTML = '<p style="text-align:center;">Nenhum produto encontrado.</p>';
        return;
    }

    const produtosPorLoja = {};
    produtos.forEach(p => {
        if (!p.disponivel) return;
        if (!produtosPorLoja[p.lojaId]) produtosPorLoja[p.lojaId] = [];
        produtosPorLoja[p.lojaId].push(p);
    });

    for (const lojaId in produtosPorLoja) {
        const lojaInfo = todasLojas.find(l => String(l.id) === String(lojaId));
        const nomeLoja = lojaInfo ? lojaInfo.nome : 'Loja Desconhecida';

        const section = document.createElement('div');
        section.className = 'loja-section';

        let html = `<h3 class="loja-titulo">${nomeLoja}</h3>`;
        html += `<div class="grid-produtos-horizontal">`;

        produtosPorLoja[lojaId].forEach(produto => {
            html += `
                <article class="card-pequeno">
                    <p class="preco-topo">R$ ${produto.preco.toFixed(2)}</p>
                    <img src="${produto.imagemBase64}" alt="${produto.titulo}">
                    <h4>${produto.titulo}</h4>
                    <a href="loja.html?id=${produto.lojaId}" class="btn-ver-mais">Ver Mais</a>
                </article>
            `;
        });

        html += `</div>`;
        section.innerHTML = html;
        container.appendChild(section);
    }
}