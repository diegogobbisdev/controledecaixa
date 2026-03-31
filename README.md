# Sistema de Controle de Caixa

## O Problema

Ser desenvolvedor é resolver problemas reais. Em um projeto anterior, desenvolvi um mini sistema web de fechamento de caixa para a empresa onde trabalho, substituindo um processo antigo que apresentava muitos erros e inconsistências. Aquela solução facilitou o controle do caixa interno e das saídas externas, com autenticação por usuário, histórico de sessões e geração de relatórios para impressão.

Com o uso, surgiu uma nova necessidade: o controle de cheques pré-datados ainda era feito em uma planilha mal organizada, causando erros nos valores e perda de datas de depósito. Fui solicitado a resolver esse problema também. Em vez de criar algo separado, evoluí o sistema anterior, integrando o controle de cheques junto ao fechamento de caixa em uma solução única, mais completa e mais organizada para o fluxo de trabalho da empresa.

---

## Solução

Um sistema web completo de controle financeiro que roda diretamente no navegador, sem necessidade de servidor, banco de dados externo ou instalação. O sistema centraliza o fechamento de caixa diário, o controle de cheques pré-datados e a visualização de alertas em uma interface organizada com autenticação por usuário.

---

## Tecnologias Utilizadas

| Tecnologia | Uso no projeto |
|---|---|
| HTML5 | Estrutura semântica das páginas |
| CSS3 | Layout, responsividade e estilização |
| JavaScript (Vanilla ES6+) | Toda a lógica de negócio e persistência |
| localStorage | Armazenamento de dados no navegador |
| sessionStorage | Controle de sessão do usuário logado |
| jsPDF + jsPDF-AutoTable | Exportação de cheques em PDF |

Nenhuma dependência de framework ou biblioteca de UI. O projeto roda completamente no navegador com abertura direta dos arquivos HTML.

---

## Estrutura de Arquivos

```
Fechamento de caixa/
├── login.html                  — Tela de login e cadastro de usuários
├── dasboard.html               — Layout principal com sidebar e navegação
├── home.html                   — Pagina inicial com resumo e alertas
├── fechamentocaixa.html        — Modulo de fechamento de caixa diario
├── chequepredatado.html        — Modulo de controle de cheques pre-datados
└── assets/
    ├── css/
    │   ├── login.css           — Estilos da tela de acesso
    │   ├── dashboard.css       — Estilos do layout principal
    │   ├── home.css            — Estilos da pagina inicial
    │   ├── style.css           — Estilos do fechamento de caixa
    │   └── cheque.css          — Estilos do controle de cheques
    └── js/
        ├── login.js            — Logica de autenticacao
        ├── home.js             — Logica da pagina inicial
        ├── script.js           — Logica do fechamento de caixa
        └── cheque.js           — Logica do controle de cheques
```

---

## Funcionalidades

### Autenticacao

- Cadastro de usuarios com validacao de senha e confirmacao
- Login com verificacao de credenciais salvas no localStorage
- Sessao ativa armazenada no sessionStorage — encerrada ao fechar o navegador
- Protecao do dashboard: qualquer acesso sem sessao ativa redireciona para o login
- Botao de sair encerra a sessao e retorna para a tela de login

### Pagina Inicial

- Exibe o ultimo total de saidas externas registrado
- Exibe o ultimo saldo do cofre registrado
- Exibe a data e hora do ultimo fechamento salvo
- Lista todos os cheques com data de desconto igual ou anterior ao dia atual que ainda nao foram depositados
- Cheques do dia recebem destaque visual diferenciado dos cheques em atraso

### Fechamento de Caixa

- Registro de saidas externas (Caixa de Fora) com descricao e valor
- Registro de movimentacoes internas do cofre com opcao de entrada ou saida
- Remocao individual de qualquer lancamento com recalculo automatico dos totais
- Saldo do cofre com indicacao visual de positivo, negativo ou neutro
- Salvamento do fechamento diario com data, totais e detalhamento completo de cada lancamento
- Historico de ate 30 sessoes anteriores com visualizacao expandivel por fechamento
- Impressao de relatorio formatado em nova janela com layout limpo
- Limpeza total dos lancamentos e do historico, zerando todos os saldos

### Controle de Cheques Pre-Datados

- Cadastro de cheques com emitente, numero, agencia, data de entrega, data de desconto e valor
- Tabela ordenada automaticamente por data de desconto
- Marcacao de cheques como depositados com indicacao visual na linha
- Edicao de qualquer cheque sem perda dos demais dados
- Exclusao individual com confirmacao
- Calculo automatico do total pendente (excluindo depositados)
- Exportacao da tabela completa em PDF com total pendente ao final

---

## Como Executar

1. Clone ou baixe o repositorio
2. Abra o arquivo `login.html` diretamente no navegador
3. Crie uma conta na aba "Criar Conta"
4. Faca login e utilize o sistema normalmente

Nao e necessario instalar nada, configurar servidor ou rodar comandos. O sistema funciona completamente offline.

---

## Decisoes Tecnicas

**Persistencia sem servidor:** todos os dados sao salvos no localStorage do navegador, o que permite uso offline e sem infraestrutura. A escolha e adequada para uso em maquina unica ou intranet local.

**SPA com iframe:** o dashboard carrega cada modulo em um iframe, isolando o estado de cada pagina e permitindo navegacao sem recarregar o layout principal.

**Autenticacao por sessionStorage:** a sessao e deliberadamente vinculada ao sessionStorage para expirar ao fechar o navegador, sem necessidade de logout manual em uso diario.

**Ordenacao automatica de cheques:** a cada insercao, a tabela e reordenada por data de desconto, garantindo que os cheques mais proximos do vencimento fiquem sempre no topo.

**Historico limitado a 30 sessoes:** o limite evita crescimento indefinido do localStorage mantendo rastreabilidade suficiente para uso pratico.
"# controledecaixa"  
