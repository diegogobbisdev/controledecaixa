// UTILITÁRIOS

function formatarData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Soma apenas cheques NÃO depositados (col 6 = Valor, excluindo linhas .depositado)
function atualizarTotal() {
    let total = 0;
    document.querySelectorAll('#chequeListBody tr').forEach(function(row) {
        if (row.dataset.depositado === 'true') return;
        const cel = row.cells[6];
        if (!cel) return;
        const num = parseFloat(cel.textContent.replace('R$ ', '').replace(',', '.'));
        if (!isNaN(num)) total += num;
    });
    document.getElementById('total').textContent = total.toFixed(2).replace('.', ',');
}

// ADICIONAR CHEQUE

function adicionarCheque() {
    const emitente     = document.getElementById('emitente').value.trim();
    const numeroCheque = document.getElementById('numeroCheque').value.trim();
    const agencia      = document.getElementById('agencia').value.trim();
    const dataEntrega  = document.getElementById('dataEntrega').value;
    const dataDesconto = document.getElementById('dataDesconto').value;
    const valorRaw     = document.getElementById('valor').value;

    if (!emitente || !numeroCheque || !agencia || !dataEntrega || !dataDesconto || valorRaw === '') {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    const valorNum = parseFloat(valorRaw);
    if (isNaN(valorNum) || valorNum <= 0) {
        alert('Informe um valor válido maior que zero!');
        return;
    }

    const cheque = {
        emitente,
        numeroCheque,
        agencia,
        dataEntrega,
        dataDesconto,
        valor:      valorNum.toFixed(2).replace('.', ','),
        depositado: false,
    };

    adicionarChequeNaTabela(cheque);
    salvarChequesNoLocalStorage();
    atualizarTotal();
    document.getElementById('chequeForm').reset();
}

// RENDERIZAR LINHA NA TABELA
// Colunas: [0]Depositado [1]Emitente [2]Nº [3]Agência
//          [4]Entrega    [5]Desconto  [6]Valor [7]Ações

function adicionarChequeNaTabela(cheque) {
    const dep = cheque.depositado === true || cheque.depositado === 'true';
    const row = document.createElement('tr');
    row.dataset.depositado = dep ? 'true' : 'false';
    if (dep) row.classList.add('linha-depositada');

    row.innerHTML = `
        <td class="td-depositado">
            <button class="btn-depositar ${dep ? 'btn-depositado' : ''}"
                    onclick="toggleDepositado(this)">
                ${dep ? '✔ Depositado' : 'Depositar'}
            </button>
        </td>
        <td>${cheque.emitente}</td>
        <td>${cheque.numeroCheque}</td>
        <td>${cheque.agencia}</td>
        <td>${formatarData(cheque.dataEntrega)}</td>
        <td>${formatarData(cheque.dataDesconto)}</td>
        <td>R$ ${cheque.valor}</td>
        <td class="td-acoes">
            <button class="btn-editar"  onclick="editarCheque(this)">✏ Editar</button>
            <button class="btn-deletar" onclick="deletarCheque(this)">✕ Deletar</button>
        </td>
    `;

    document.getElementById('chequeListBody').appendChild(row);
    ordenarChequesPorDataDesconto();
}

// DEPOSITAR / TOGGLE

function toggleDepositado(botao) {
    const row = botao.closest('tr');
    const dep = row.dataset.depositado === 'true';

    if (!dep) {
        row.dataset.depositado = 'true';
        row.classList.add('linha-depositada');
        botao.textContent = '✔ Depositado';
        botao.classList.add('btn-depositado');
    } else {
        row.dataset.depositado = 'false';
        row.classList.remove('linha-depositada');
        botao.textContent = 'Depositar';
        botao.classList.remove('btn-depositado');
    }

    salvarChequesNoLocalStorage();
    atualizarTotal();
}

// EDITAR — preenche o formulário e remove a linha

function editarCheque(botao) {
    const row = botao.closest('tr');

    // Converte dd/mm/aaaa → aaaa-mm-dd para os inputs date
    function toInputDate(str) {
        const p = str.trim().split('/');
        return p[2] + '-' + p[1] + '-' + p[0];
    }

    document.getElementById('emitente').value     = row.cells[1].textContent.trim();
    document.getElementById('numeroCheque').value = row.cells[2].textContent.trim();
    document.getElementById('agencia').value      = row.cells[3].textContent.trim();
    document.getElementById('dataEntrega').value  = toInputDate(row.cells[4].textContent);
    document.getElementById('dataDesconto').value = toInputDate(row.cells[5].textContent);
    document.getElementById('valor').value        = parseFloat(
        row.cells[6].textContent.replace('R$ ', '').replace(',', '.')
    ).toFixed(2);

    row.remove();
    salvarChequesNoLocalStorage();
    atualizarTotal();
    document.getElementById('emitente').focus();
}

// DELETAR

function deletarCheque(botao) {
    if (!confirm('Remover este cheque?')) return;
    botao.closest('tr').remove();
    salvarChequesNoLocalStorage();
    atualizarTotal();
}

// ORDENAR POR DATA DE DESCONTO (col 5)

function ordenarChequesPorDataDesconto() {
    const tbody = document.getElementById('chequeListBody');
    const rows  = Array.from(tbody.querySelectorAll('tr'));

    rows.sort(function(a, b) {
        const textoA = a.cells[5].textContent.trim();
        const textoB = b.cells[5].textContent.trim();
        const dataA  = new Date(textoA.split('/').reverse().join('-'));
        const dataB  = new Date(textoB.split('/').reverse().join('-'));
        return dataA - dataB;
    });

    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
    rows.forEach(function(row) { tbody.appendChild(row); });
}

// LOCAL STORAGE

function salvarChequesNoLocalStorage() {
    const cheques = [];
    document.querySelectorAll('#chequeListBody tr').forEach(function(row) {
        cheques.push({
            depositado:   row.dataset.depositado === 'true',
            emitente:     row.cells[1].textContent.trim(),
            numeroCheque: row.cells[2].textContent.trim(),
            agencia:      row.cells[3].textContent.trim(),
            dataEntrega:  row.cells[4].textContent.trim().split('/').reverse().join('-'),
            dataDesconto: row.cells[5].textContent.trim().split('/').reverse().join('-'),
            valor:        row.cells[6].textContent.trim().replace('R$ ', ''),
        });
    });
    localStorage.setItem('jt_cheques', JSON.stringify(cheques));
}

function carregarChequesDoLocalStorage() {
    const cheques = JSON.parse(localStorage.getItem('jt_cheques')) || [];
    cheques.forEach(function(cheque) { adicionarChequeNaTabela(cheque); });
    atualizarTotal();
}

// EXPORTAR PDF (apenas não depositados)

function salvarComoPDF() {
    const { jsPDF } = window.jspdf;
    const doc     = new jsPDF();
    const headers = [["Emitente", "Nº Cheque", "Agência", "Entrega", "Desconto", "Valor", "Status"]];
    const dados   = [];

    document.querySelectorAll('#chequeListBody tr').forEach(function(row) {
        dados.push([
            row.cells[1].textContent.trim(),
            row.cells[2].textContent.trim(),
            row.cells[3].textContent.trim(),
            row.cells[4].textContent.trim(),
            row.cells[5].textContent.trim(),
            row.cells[6].textContent.trim(),
            row.dataset.depositado === 'true' ? 'Depositado' : 'Pendente',
        ]);
    });

    const total = dados.reduce(function(acc, row) {
        if (row[6] === 'Depositado') return acc;
        const val = parseFloat(row[5].replace('R$ ', '').replace(',', '.'));
        return acc + (isNaN(val) ? 0 : val);
    }, 0);

    doc.setFontSize(16);
    doc.text('Planilha de Cheques Pré-Datados', 10, 14);
    doc.autoTable({ head: headers, body: dados, startY: 22, theme: 'grid' });
    doc.setFontSize(12);
    doc.text(
        `Total Pendente: R$ ${total.toFixed(2).replace('.', ',')}`,
        10,
        doc.lastAutoTable.finalY + 10
    );
    doc.save('cheques_pre_datados.pdf');
}

// INICIALIZAÇÃO

window.onload = function() {
    carregarChequesDoLocalStorage();
};
