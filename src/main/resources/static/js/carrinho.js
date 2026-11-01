const API_URL_CARRINHO = 'http://localhost:8080/api';
let carrinho = JSON.parse(localStorage.getItem('market_carrinho')) || [];
let lojaIdAtual = carrinho.length > 0 ? carrinho[0].lojaId : null;

async function renderizarCarrinho() {
    const container = document.getElementById('itens-carrinho');
    const spanTotal = document.getElementById('total-carrinho');
    
    if (carrinho.length === 0) {
        container.innerHTML = '<p>Seu carrinho está vazio.</p>';
        spanTotal.innerText = '0.00';
        return;
    }

    let html = '';
    let total = 0;

    carrinho.forEach((item, index) => {
        let subtotal = item.preco * item.quantidade;
        total += subtotal;
        html += `
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #ddd; padding: 1rem 0;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <img src="${item.imagem}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                    <div>
                        <strong>${item.titulo}</strong><br>
                        <small>R$ ${item.preco.toFixed(2)} x ${item.quantidade}</small>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <strong>R$ ${subtotal.toFixed(2)}</strong>
                    <button onclick="removerItem(${index})" class="btn-perigo" style="padding: 0.2rem 0.5rem;">X</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    spanTotal.innerText = total.toFixed(2);

    if (lojaIdAtual) {
        buscarEncontrosDaLoja(lojaIdAtual);
    }
}

async function buscarEncontrosDaLoja(lojaId) {
    try {
        const res = await fetch(`${API_URL_CARRINHO}/encontros`);
        if (res.ok) {
            const todos = await res.json();
            const encontrosDaLoja = todos.filter(e => String(e.lojaId) === String(lojaId));
            
            const select = document.getElementById('select-encontros');
            encontrosDaLoja.forEach(enc => {
                const opcao = document.createElement('option');
                opcao.value = enc.local || enc.nome;
                opcao.text = `${enc.local || enc.nome} ${enc.descricao ? ' - ' + enc.descricao : ''}`;
                select.appendChild(opcao);
            });
        }
    } catch (e) {}
}

function removerItem(index) {
    carrinho.splice(index, 1);
    localStorage.setItem('market_carrinho', JSON.stringify(carrinho));
    renderizarCarrinho();
}

function limparCarrinho() {
    if (carrinho.length === 0 || arguments[0] === 'forcar') {
        localStorage.removeItem('market_carrinho');
        carrinho = [];
        renderizarCarrinho();
        return;
    }

    mostrarConfirmacao(
        "Esvaziar Carrinho",
        "Tem certeza que deseja remover todos os itens do seu carrinho?",
        "Sim, Esvaziar",
        () => {
            localStorage.removeItem('market_carrinho');
            carrinho = [];
            renderizarCarrinho();
            mostrarMensagem("Carrinho esvaziado com sucesso.");
        }
    );
}

async function finalizarPedidoWhatsApp() {
    if (carrinho.length === 0) {
        mostrarMensagem("O carrinho está vazio.", "erro");
        return;
    }

    const encontroSelecionado = document.getElementById('select-encontros').value;
    
    const token = localStorage.getItem('market_token'); 
    
    let numeroVendedor = "5511999999999"; 
    
    try {
        const resLoja = await fetch(`${API_URL_CARRINHO}/lojas/${lojaIdAtual}`, {
            headers: { 'Authorization': token }
        });
        
        if (resLoja.ok) {
            const loja = await resLoja.json();
            
            const resVendedor = await fetch(`${API_URL_CARRINHO}/usuarios/${loja.vendedorId}`, {
                headers: { 'Authorization': token }
            });
            
            if (resVendedor.ok) {
                const vendedor = await resVendedor.json();
                numeroVendedor = vendedor.celular.replace(/\D/g, ''); 
            } else {
                console.error("Erro de permissão ao buscar Vendedor:", resVendedor.status);
            }
        } else {
            console.error("Erro de permissão ao buscar Loja:", resLoja.status);
        }
    } catch(e) {
        console.error("Erro de conexão na finalização:", e);
    }

    let textoPedido = "Olá! Gostaria de fazer o seguinte pedido:\n\n";
    let totalPedido = 0;

    carrinho.forEach(item => {
        let subtotal = item.preco * item.quantidade;
        totalPedido += subtotal;
        textoPedido += `▪️ ${item.quantidade}x ${item.titulo} - R$ ${subtotal.toFixed(2)}\n`;
    });

    textoPedido += `\n*Total:* R$ ${totalPedido.toFixed(2)}\n`;
    
    if (encontroSelecionado === "A combinar") {
        textoPedido += `*Local de Entrega:* Precisamos combinar um local para a entrega!`;
    } else {
        textoPedido += `*Local de Entrega:* ${encontroSelecionado}`;
    }

    const url = `https://wa.me/${numeroVendedor}?text=${encodeURIComponent(textoPedido)}`;
    
    limparCarrinho('forcar');
    window.open(url, '_blank');
}

renderizarCarrinho();