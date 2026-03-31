function getUsuarios() {
    return JSON.parse(localStorage.getItem('jt_usuarios') || '[]');
}

function setUsuarios(lista) {
    localStorage.setItem('jt_usuarios', JSON.stringify(lista));
}

function setMensagem(idMsg, texto, tipo) {
    var el = document.getElementById(idMsg);
    el.textContent = texto;
    el.className = 'msg ' + tipo;
}

function mostrarAba(aba) {
    document.getElementById('painel-login').style.display    = aba === 'login'    ? 'block' : 'none';
    document.getElementById('painel-registro').style.display = aba === 'registro' ? 'block' : 'none';
    document.getElementById('tab-login').classList.toggle('active',    aba === 'login');
    document.getElementById('tab-registro').classList.toggle('active', aba === 'registro');
    document.getElementById('msg-login').className    = 'msg';
    document.getElementById('msg-registro').className = 'msg';
}

function fazerLogin() {
    var usuario = document.getElementById('login-usuario').value.trim();
    var senha   = document.getElementById('login-senha').value;

    if (!usuario || !senha) {
        setMensagem('msg-login', 'Preencha usuário e senha.', 'erro');
        return;
    }

    var usuarios = getUsuarios();
    var encontrado = usuarios.find(function(u) {
        return u.usuario === usuario && u.senha === senha;
    });

    if (!encontrado) {
        setMensagem('msg-login', 'Usuário ou senha incorretos.', 'erro');
        return;
    }

    sessionStorage.setItem('jt_sessao', JSON.stringify({ usuario: usuario }));
    window.location.href = 'dasboard.html';
}

function fazerRegistro() {
    var usuario  = document.getElementById('reg-usuario').value.trim();
    var senha    = document.getElementById('reg-senha').value;
    var confirma = document.getElementById('reg-confirma').value;

    if (!usuario || !senha || !confirma) {
        setMensagem('msg-registro', 'Preencha todos os campos.', 'erro');
        return;
    }

    if (senha !== confirma) {
        setMensagem('msg-registro', 'As senhas não coincidem.', 'erro');
        return;
    }

    if (senha.length < 4) {
        setMensagem('msg-registro', 'A senha deve ter no mínimo 4 caracteres.', 'erro');
        return;
    }

    var usuarios = getUsuarios();
    var jaExiste = usuarios.find(function(u) { return u.usuario === usuario; });

    if (jaExiste) {
        setMensagem('msg-registro', 'Esse usuário já está cadastrado.', 'erro');
        return;
    }

    usuarios.push({ usuario: usuario, senha: senha });
    setUsuarios(usuarios);

    document.getElementById('reg-usuario').value  = '';
    document.getElementById('reg-senha').value    = '';
    document.getElementById('reg-confirma').value = '';

    setMensagem('msg-registro', 'Conta criada! Faça login para continuar.', 'sucesso');
    setTimeout(function() { mostrarAba('login'); }, 1500);
}

// Permite confirmar com Enter nos inputs
document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;
    var painelLogin    = document.getElementById('painel-login');
    var painelRegistro = document.getElementById('painel-registro');
    if (painelLogin.style.display !== 'none')    fazerLogin();
    else if (painelRegistro.style.display !== 'none') fazerRegistro();
});

// Se já estiver logado, redireciona direto pro dashboard
if (sessionStorage.getItem('jt_sessao')) {
    window.location.href = 'dasboard.html';
}
