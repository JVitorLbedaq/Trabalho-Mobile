const tokenAtual = localStorage.getItem('market_token');
const roleAtual = localStorage.getItem('market_role');

if (!tokenAtual || roleAtual !== 'ROLE_ADMIN') {
    window.location.href = 'home.html';
}