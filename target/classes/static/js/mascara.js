function aplicarMascaraCelular(inputElement) {
    if (!inputElement) return;
    
    inputElement.addEventListener('input', function (e) {
        let valor = e.target.value.replace(/\D/g, '');
        
        if (valor.length > 11) valor = valor.slice(0, 11);
        
        if (valor.length > 2) {
            valor = `(${valor.substring(0, 2)}) ${valor.substring(2)}`;
        }
        if (valor.length > 10) {
            valor = `${valor.substring(0, 10)}-${valor.substring(10)}`;
        }
        
        e.target.value = valor;
    });
}

function prepararCelularParaAPI(celularFormatado) {
    let numeroLimpo = celularFormatado.replace(/\D/g, '');
    if (numeroLimpo.length === 11) {
        return '55' + numeroLimpo;
    }
    return numeroLimpo;
}