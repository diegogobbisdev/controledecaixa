function carregarSaldos() {
    var raw = localStorage.getItem('jt_caixa');
    if (!raw) return;

    var data    = JSON.parse(raw);
    var sessions = data.sessions || [];
    var ultima  = sessions[0] || null;

    if (!ultima) return;

    document.getElementById('homePrevFora').innerText  = 'R$ ' + parseFloat(ultima.totalFora).toFixed(2).replace('.', ',');
    document.getElementById('homePrevCofre').innerText = 'R$ ' + parseFloat(ultima.saldoCofre).toFixed(2).replace('.', ',');
    document.getElementById('homeUltimaData').innerText = ultima.data
        ? ultima.data.split('-').reverse().join('/') + (ultima.savedAt ? '  •  ' + ultima.savedAt : '')
        : '—';
}

function carregarChequesAlerta() {
    var raw     = localStorage.getItem('jt_cheques');
    var cheques = raw ? JSON.parse(raw) : [];
    var hoje    = new Date();
    hoje.setHours(0, 0, 0, 0);

    var pendentes = cheques.filter(function(c) {
        if (c.depositado === true || c.depositado === 'true') return false;
        var partes = c.dataDesconto.split('-');
        var data   = new Date(partes[0], partes[1] - 1, partes[2]);
        return data <= hoje;
    });

    var container = document.getElementById('chequesAlerta');

    if (pendentes.length === 0) {
        container.innerHTML = '<div class="empty-msg">Nenhum cheque pendente para hoje ou em atraso.</div>';
        return;
    }

    container.innerHTML = pendentes.map(function(c) {
        var partes  = c.dataDesconto.split('-');
        var data    = new Date(partes[0], partes[1] - 1, partes[2]);
        var isHoje  = data.getTime() === hoje.getTime();
        var dataFmt = partes[2] + '/' + partes[1] + '/' + partes[0];

        return '<div class="cheque-card ' + (isHoje ? 'hoje' : '') + '">' +
            '<div class="cheque-info">' +
                '<span class="cheque-emitente">' + c.emitente + '</span>' +
                '<span class="cheque-detalhe">Cheque Nº ' + c.numeroCheque + '  •  Agência: ' + c.agencia + '  •  Desconto: ' + dataFmt + '</span>' +
            '</div>' +
            '<div style="display:flex; align-items:center; gap:10px;">' +
                '<span class="badge ' + (isHoje ? 'badge-hoje' : 'badge-atraso') + '">' + (isHoje ? 'Hoje' : 'Em atraso') + '</span>' +
                '<span class="cheque-valor">R$ ' + parseFloat(c.valor.replace(',', '.')).toFixed(2).replace('.', ',') + '</span>' +
            '</div>' +
        '</div>';
    }).join('');
}

window.onload = function() {
    carregarSaldos();
    carregarChequesAlerta();
};
