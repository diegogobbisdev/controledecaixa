// ============================================================
// UTILITÁRIOS
// ============================================================

function fmt(val) {
    return parseFloat(val || 0).toFixed(2);
}

// ============================================================
// ESTADO GLOBAL
// ============================================================
let totalFora = 0;
let saldoCofre = 0;
let valorAnteriorCofre = 0;
let valorAnteriorFora = 0;

// ============================================================
// INICIALIZAÇÃO DO APP
// ============================================================
function startApp() {
    document.getElementById('dataAtual').value = new Date().toISOString().split('T')[0];

    const userData = getUserData();
    const sessions = userData.sessions || [];
    const ultima = sessions[0] || null;

    valorAnteriorFora  = ultima ? parseFloat(ultima.totalFora)  : 0;
    valorAnteriorCofre = ultima ? parseFloat(ultima.saldoCofre) : 0;

    document.getElementById('prevFora').innerText  = fmt(valorAnteriorFora);
    document.getElementById('prevCofre').innerText = fmt(valorAnteriorCofre);

    totalFora  = 0;
    saldoCofre = valorAnteriorCofre;

    document.getElementById('listaReferenciasFora').innerHTML  = '';
    document.getElementById('listaReferenciasCofre').innerHTML = '';

    atualizarTelas();
    renderHistorico();
}

// ============================================================
// STORAGE
// ============================================================
function getUserData() {
    const raw = localStorage.getItem('jt_caixa');
    return raw ? JSON.parse(raw) : { sessions: [] };
}

function saveUserData(data) {
    localStorage.setItem('jt_caixa', JSON.stringify(data));
}


// ============================================================
// MOVIMENTAÇÕES
// ============================================================
function adicionarRetirada(caixa) {
    if (caixa === 'fora') {
        const ref = document.getElementById('referenciaFora').value.trim();
        const val = parseFloat(document.getElementById('valorFora').value);

        if (!ref) return alert('Preencha a descrição.');
        if (isNaN(val) || val <= 0) return alert('Valor inválido. Use apenas números positivos.');

        totalFora  += val;
        saldoCofre += val;
        renderItem('listaReferenciasFora', ref, val);

        document.getElementById('referenciaFora').value = '';
        document.getElementById('valorFora').value      = '';

    } else {
        const ref = document.getElementById('referenciaCofre').value.trim();
        const val = parseFloat(document.getElementById('valorCofre').value);
        const op  = document.getElementById('tipoOperacao').value;

        if (!ref) return alert('Preencha a descrição.');
        if (isNaN(val) || val <= 0) return alert('Valor inválido. Use apenas números positivos.');

        const ajuste = op === 'subtrair' ? -val : val;
        saldoCofre += ajuste;
        renderItem('listaReferenciasCofre', ref, ajuste);

        document.getElementById('referenciaCofre').value = '';
        document.getElementById('valorCofre').value      = '';
    }
    atualizarTelas();
}

function renderItem(idLista, ref, val) {
    const li = document.createElement('li');
    const isNeg = val < 0;
    const sinal = isNeg ? '[-]' : '[+]';
    const cor   = isNeg ? 'red' : 'green';

    const span = document.createElement('span');
    span.innerHTML = `<strong>${ref}</strong>: R$ ${Math.abs(val).toFixed(2)} <span style="color:${cor}">${sinal}</span>`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-remove-item no-print';
    button.innerText = '✕';

    button.addEventListener('click', function () {
        if (!confirm('Remover este lançamento?')) return;
        li.remove();
        if (idLista === 'listaReferenciasFora') {
            totalFora  -= val;
            saldoCofre -= val;
        } else {
            saldoCofre -= val;
        }
        atualizarTelas();
    });

    li.appendChild(span);
    li.appendChild(button);
    document.getElementById(idLista).appendChild(li);
}

function atualizarTelas() {
    document.getElementById('totalRetiradoFora').innerText = fmt(totalFora);
    document.getElementById('saldoCofre').innerText        = fmt(saldoCofre);

    const box = document.getElementById('saldoCofre').closest('.result-box');
    box.classList.remove('saldo-positivo', 'saldo-negativo');
    if (saldoCofre > 0)      box.classList.add('saldo-positivo');
    else if (saldoCofre < 0) box.classList.add('saldo-negativo');
}

// ============================================================
// LIMPAR LANÇAMENTOS
// ============================================================
function limparLancamentos() {
    if (!confirm('Isso apagará todos os lançamentos e o histórico completo. Confirmar?')) return;

    document.getElementById('listaReferenciasFora').innerHTML  = '';
    document.getElementById('listaReferenciasCofre').innerHTML = '';

    totalFora          = 0;
    saldoCofre         = 0;
    valorAnteriorFora  = 0;
    valorAnteriorCofre = 0;

    document.getElementById('prevFora').innerText  = '0.00';
    document.getElementById('prevCofre').innerText = '0.00';

    saveUserData({ sessions: [] });
    atualizarTelas();
    renderHistorico();
}

// ============================================================
// SALVAR FECHAMENTO
// ============================================================
function salvarFechamento() {
    const data = document.getElementById('dataAtual').value;
    const userData = getUserData();

    const itensFora = [...document.querySelectorAll('#listaReferenciasFora li')].map(li => {
        const s = li.querySelector('span');
        return s ? s.innerText : '';
    });
    const itensCofre = [...document.querySelectorAll('#listaReferenciasCofre li')].map(li => {
        const s = li.querySelector('span');
        return s ? s.innerText : '';
    });

    const sessao = {
        data,
        totalFora:  fmt(totalFora),
        saldoCofre: fmt(saldoCofre),
        itensFora,
        itensCofre,
        savedAt: new Date().toLocaleString('pt-BR')
    };

    userData.sessions = [sessao, ...(userData.sessions || [])].slice(0, 30);
    saveUserData(userData);

    valorAnteriorFora  = totalFora;
    valorAnteriorCofre = saldoCofre;
    document.getElementById('prevFora').innerText  = fmt(valorAnteriorFora);
    document.getElementById('prevCofre').innerText = fmt(valorAnteriorCofre);

    renderHistorico();
    alert('Fechamento salvo com sucesso!');
}

// ============================================================
// HISTÓRICO COMPLETO DE SESSÕES
// ============================================================
function toggleHistorico() {
    const panel = document.getElementById('historicoPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function renderHistorico() {
    const userData = getUserData();
    const sessions = userData.sessions || [];
    const container = document.getElementById('historicoLista');
    if (!container) return;

    if (sessions.length === 0) {
        container.innerHTML = '<p style="color:#888; font-size:13px;">Nenhuma sessão salva ainda.</p>';
        return;
    }

    container.innerHTML = sessions.map((s, i) => `
        <div class="hist-entry">
            <div class="hist-entry-header">
                <strong>📅 ${s.data}</strong>
                <span style="color:#888; font-size:12px;">Salvo: ${s.savedAt || ''}</span>
            </div>
            <div class="hist-entry-vals">
                <span>Total Fora: <strong>R$ ${s.totalFora}</strong></span>
                <span>Saldo Cofre: <strong>R$ ${s.saldoCofre}</strong></span>
                <span class="hist-detail-toggle no-print" onclick="toggleDetalhe(${i})">🔍 Detalhes</span>
            </div>
            <div id="hist-detalhe-${i}" style="display:none; margin-top:8px; font-size:12px; color:#555;">
                <em>Saídas (Fora):</em>
                <ul>${(s.itensFora||[]).map(x=>`<li>${x}</li>`).join('')||'<li>—</li>'}</ul>
                <em>Cofre:</em>
                <ul>${(s.itensCofre||[]).map(x=>`<li>${x}</li>`).join('')||'<li>—</li>'}</ul>
            </div>
        </div>
    `).join('');
}

function toggleDetalhe(i) {
    const el = document.getElementById(`hist-detalhe-${i}`);
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

// ============================================================
// IMPRESSÃO
// ============================================================
function imprimirRelatorio() {
    const data = document.getElementById('dataAtual').value;

    const listaFora = [...document.querySelectorAll('#listaReferenciasFora li')]
        .map(li => { const s = li.querySelector('span'); return `<li>${s ? s.innerText : ''}</li>`; })
        .join('') || '<li>Sem registros</li>';

    const listaCofre = [...document.querySelectorAll('#listaReferenciasCofre li')]
        .map(li => { const s = li.querySelector('span'); return `<li>${s ? s.innerText : ''}</li>`; })
        .join('') || '<li>Sem registros</li>';

    const html = `
        <html><head><title>Relatório de Caixa</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
            h2 { text-align:center; }
            h3 { border-bottom:1px solid #ccc; padding-bottom:4px; margin-top:20px; }
            ul { padding-left:20px; } li { margin-bottom:4px; font-size:14px; }
            .total { font-size:16px; font-weight:bold; margin-top:10px; }
            .footer { text-align:center; margin-top:40px; }
        </style></head><body>
            <h2>Relatório de Caixa</h2>
            <p><strong>Data:</strong> ${data}</p>
            <p><strong>Anterior Cofre:</strong> R$ ${fmt(valorAnteriorCofre)}</p>
            <h3>Caixa de Fora (Saídas)</h3>
            <ul>${listaFora}</ul>
            <p class="total">Total Saídas: R$ ${fmt(totalFora)}</p>
            <h3>Caixa Interno (Cofre)</h3>
            <ul>${listaCofre}</ul>
            <p class="total">Saldo Final Cofre: R$ ${fmt(saldoCofre)}</p>
            <div class="footer">_____________________________<br>Assinatura Responsável</div>
        </body></html>
    `;
    const win = window.open('', '', 'height=700,width=620');
    win.document.write(html);
    win.document.close();
    win.print();
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
window.onload = function () {
    startApp();
};
