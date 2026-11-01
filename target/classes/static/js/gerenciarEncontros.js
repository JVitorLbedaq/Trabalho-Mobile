const API_ENCONTROS = 'http://localhost:8080/api';
const tokenEncontro = localStorage.getItem('market_token');
const idUsuarioLog = localStorage.getItem('market_usuario_id');
let idLojaEncontro = null;

async function iniciarEncontros() {
    try {
        const res = await fetch(`${API_ENCONTROS}/lojas/vendedor/${idUsuarioLog}`, { headers: { 'Authorization': tokenEncontro } });
        if (res.ok) {
            const lojas = await res.json();
            if (lojas.length > 0) {
                idLojaEncontro = lojas[0].id;
                carregarEncontros();
            }
        }
    } catch (e) {}
}

async function carregarEncontros() {
    try {
        const res = await fetch(`${API_ENCONTROS}/encontros`);
        if (res.ok) {
            const todos = await res.json();
            const meus = todos.filter(e => String(e.lojaId) === String(idLojaEncontro));
            const lista = document.getElementById('lista-encontros');
            lista.innerHTML = '';
            meus.forEach(enc => {
                lista.innerHTML += `
                    <li style="background: white; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between;">
                        <div>
                            <strong>${enc.local || enc.nome}</strong><br>
                            <small>${enc.descricao || enc.detalhes || ''}</small>
                        </div>
                        <button onclick="deletarEncontro(${enc.id})" class="btn-perigo">Remover</button>
                    </li>
                `;
            });
        }
    } catch (e) {}
}

document.getElementById('form-encontro').addEventListener('submit', async (e) => {
    e.preventDefault();
    const local = document.getElementById('nome-local').value;
    const detalhes = document.getElementById('detalhes-local').value;

    await fetch(`${API_ENCONTROS}/encontros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': tokenEncontro },
        body: JSON.stringify({ local: local, descricao: detalhes, lojaId: idLojaEncontro }) 
    });
    document.getElementById('form-encontro').reset();
    carregarEncontros();
});

async function deletarEncontro(id) {
    mostrarConfirmacao(
        "Remover Local", 
        "Tem certeza que deseja apagar este local de entrega? Ele não aparecerá mais para os clientes.", 
        "Sim, Remover", 
        async () => {
            try {
                await fetch(`${API_ENCONTROS}/encontros/${id}`, { 
                    method: 'DELETE', 
                    headers: { 'Authorization': tokenEncontro }
                });
                carregarEncontros();
                mostrarMensagem('Local removido com sucesso!');
            } catch(e) {
                mostrarMensagem('Erro ao remover o local.', 'erro');
            }
        }
    );
}

iniciarEncontros();