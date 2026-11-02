const API_URL_NAV = 'http://localhost:8080/api';

window.mostrarMensagem = function(texto, tipo = 'sucesso') {
    let toast = document.getElementById('toast-mensagem');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-mensagem';
        toast.className = 'toast-mensagem';
        document.body.appendChild(toast);
    }
    
    toast.textContent = texto;
    toast.className = `toast-mensagem toast-${tipo} toast-visivel`;
    
    setTimeout(() => { 
        toast.classList.remove('toast-visivel'); 
    }, 3000);
};

//Cria e Modifica o modal dinâmicamente
window.mostrarConfirmacao = function(titulo, texto, textoBotaoSim, callbackConfirmar) {
    let modal = document.getElementById('modal-confirmacao-global');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-confirmacao-global';
        modal.innerHTML = `
            <div id="fundo-modal-global" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 5000; justify-content: center; align-items: center; padding: 1rem;">
                <div style="background: white; padding: 2rem; border-radius: 8px; text-align: center; max-width: 400px; width: 100%; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <h3 id="titulo-modal-global" style="margin-bottom: 0.5rem; color: #004085;"></h3>
                    <p id="texto-modal-global" style="margin-bottom: 1.5rem; color: #333;"></p>
                    <div style="display: flex; gap: 1rem;">
                        <button id="btn-sim-global" class="btn-perigo" style="flex: 1;"></button>
                        <button id="btn-nao-global" class="btn-secundario" style="flex: 1;">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('titulo-modal-global').textContent = titulo;
    document.getElementById('texto-modal-global').textContent = texto;
    
    const btnSim = document.getElementById('btn-sim-global');
    btnSim.textContent = textoBotaoSim;

    const novoBtnSim = btnSim.cloneNode(true);
    btnSim.parentNode.replaceChild(novoBtnSim, btnSim);

    // Mostra o modal
    const fundoModal = document.getElementById('fundo-modal-global');
    fundoModal.style.display = 'flex';

    novoBtnSim.addEventListener('click', () => {
        fundoModal.style.display = 'none';
        callbackConfirmar(); 
    });

    document.getElementById('btn-nao-global').addEventListener('click', () => {
        fundoModal.style.display = 'none';
    });
};

document.addEventListener('DOMContentLoaded', async () => {
    const menu = document.getElementById('navbar-menu');
    const hamburger = document.getElementById('hamburger-btn');
    const navPerfil = document.getElementById('nav-perfil');
    const navDinamico = document.getElementById('nav-dinamico');
    const navAuth = document.getElementById('nav-auth');

    if (hamburger && menu) {
        hamburger.addEventListener('click', () => {
            menu.classList.toggle('ativo');
        });
    }

    const token = localStorage.getItem('market_token');
    const role = localStorage.getItem('market_role');
    const idUsuario = localStorage.getItem('market_usuario_id');

    if (token) {
        try {
            const res = await fetch(`${API_URL_NAV}/usuarios/me`, {
                headers: { 'Authorization': token }
            });
            if (res.ok) {
                const usuario = await res.json();
                navPerfil.style.display = 'block';
                navPerfil.textContent = usuario.nome;
            }
        } catch (erro) {}

        navDinamico.style.display = 'block';
        
        const linkCarrinho = document.createElement('a');
        linkCarrinho.href = 'carrinho.html';
        linkCarrinho.textContent = 'Carrinho';
        menu.insertBefore(linkCarrinho, navAuth);

        if (role === 'ROLE_ADMIN') {
            navDinamico.textContent = 'Minha Loja';
            try {
                const resLoja = await fetch(`${API_URL_NAV}/lojas/vendedor/${idUsuario}`, {
                    headers: { 'Authorization': token }
                });
                if (resLoja.ok) {
                    const lojas = await resLoja.json();
                    if (lojas.length > 0) {
                        navDinamico.href = `loja.html?id=${lojas[0].id}`;
                    } else {
                        navDinamico.href = 'criaLoja.html';
                    }
                }
            } catch (erro) {}
        } else {
            navDinamico.style.display = 'none';
        }

        navAuth.textContent = 'Sair';
        navAuth.href = '#';
        navAuth.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});