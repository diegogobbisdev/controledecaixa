# Sistema de Caixa

Sistema web de fechamento de caixa com controle de saídas externas e saldo do cofre interno, com autenticação por usuário e histórico de sessões.

---

## Tecnologias utilizadas

| Tecnologia | Versão / Tipo |
|------------|--------------|
| HTML5      | Semântico, sem frameworks |
| CSS3       | Puro, sem bibliotecas externas |
| JavaScript | Vanilla ES6+, sem frameworks |

Não utiliza nenhuma dependência externa — todo o projeto roda diretamente no navegador, sem servidor ou build.

---

## Estrutura de arquivos

```
Fechamento de caixa/
├── index.html
└── assets/
    ├── css/
    │   └── style.css
    └── js/
        └── script.js
```

---

## HTML

- Estrutura semântica com `header`, `main` e `section`
- Formulários com inputs controlados via JavaScript (sem `action`)
- Separação entre tela de login (`#authWrapper`) e dashboard (`#mainContainer`), alternadas via `display: none / block`
- Atributo `onkeydown` para submissão do login com Enter
- Classe `no-print` para ocultar elementos na impressão

---

## CSS

- **Flexbox** em toda a estrutura de layout (dashboard, header, listas, botões)
- **`flex-direction: column` + `margin-top: auto`** para empurrar o botão "Limpar Lançamentos" para o rodapé da coluna de ações
- **Classes dinâmicas** no resultado do cofre: `.saldo-positivo` (verde), `.saldo-negativo` (vermelho claro) e estado neutro `#eee` — aplicadas via JavaScript conforme o valor
- **`overflow-y: auto` com `max-height`** nas listas de lançamentos para rolagem interna
- **`@media print`** com `.no-print { display: none }` para relatório limpo ao imprimir
- **`box-sizing: border-box`** global para consistência de espaçamentos
- Responsividade básica via `flex-wrap: wrap` e `min-width` nas seções

---

## JavaScript

- **`localStorage`** para persistência de dados por usuário (sem banco de dados)
  - Cada usuário é salvo como `jt_user_<nome>`, com senha e histórico de sessões
  - Sessão ativa salva em `jt_session` para auto-login ao reabrir o browser
- **Autenticação** com cadastro e login, senha ofuscada com `btoa` (uso local/intranet)
- **Event listeners diretos** em cada botão de remoção (criados dentro de `renderItem`), capturando `val` e `idLista` via closure — elimina necessidade de event delegation
- **Recálculo em tempo real** do `totalFora` e `saldoCofre` a cada adição ou remoção de lançamento
- **Histórico de até 30 sessões** por usuário, com detalhe expansível de cada fechamento
- **Impressão via `window.open`** gerando HTML estilizado em uma nova janela e chamando `window.print()` automaticamente
- **`closest('li')`** para localizar e remover o item correto da lista ao clicar no botão ✕

---

## Funcionalidades

- Login e cadastro de usuários
- **Caixa de Fora** — registro de saídas externas com descrição e valor
- **Caixa Interno (Cofre)** — entradas e saídas com saldo acumulado
- Remoção individual de lançamentos com o botão ✕
- Saldo do cofre com cor dinâmica (cinza / verde / vermelho)
- Salvamento de fechamento diário com histórico completo
- Limpeza de lançamentos do dia
- Impressão de relatório formatado
- Auto-login por sessão salva no navegador
