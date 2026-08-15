# Email de acesso ao painel

Rascunho pronto para envio **depois** que o painel estiver no ar e testado em
produção. Enviar antes é mandar quatro pessoas para uma porta que não abre.

Destinatários: `leo@`, `marcus@`, `luiz@` e `lala@baxi.ia.br`.
Remetente sugerido: `contato@baxi.ia.br` (mesma identidade SES do resto).

---

**Assunto:** Seu acesso ao painel da BaXiJen

Olá, {PRIMEIRO_NOME}!

O painel de leads da BaXiJen está no ar e você tem acesso.

**Como entrar**

1. Abra https://www.baxijen.com.br/admin
2. Digite seu email (`{EMAIL}`) e peça o código.
3. Chega um email com um código de 6 dígitos. Digite na mesma tela.

Pronto. Não há senha para criar, guardar ou esquecer. O acesso fica valendo por
7 dias no navegador; depois disso o painel pede um código novo.

**O que tem lá**

- **Visão geral** — total de leads, quantos entraram nos últimos 7 e 30 dias,
  pipeline por status, score médio e os números da newsletter.
- **Leads** — busca, filtro por status, exportação em CSV, e o histórico de cada
  lead: chat, mensagem do formulário, telefone, empresa e objetivo.
- Mudar o status de um lead (novo, contatado, qualificado, convertido, perdido)
  fica registrado com o seu nome. Isso é de propósito: dá para saber quem moveu
  o quê e quando, o que antes era impossível porque todo mundo usava a mesma
  senha.

**Três detalhes que valem saber**

- O código vale por 10 minutos, serve uma vez só e aceita 5 tentativas. Se
  errar demais, é só pedir outro.
- Se você digitar um email que não está na lista de acesso, a resposta é a mesma
  — e nenhum email é enviado. É proposital: assim ninguém descobre por
  tentativa quem tem acesso.
- O código chega no seu email; você pode pedir no computador e ler no celular
  sem problema, porque é código digitado e não link para clicar.

Qualquer coisa estranha — código que não chega, tela que não abre — me chama.

Marcus

---

## Como enviar

Nomes e emails, para o preenchimento:

| `{PRIMEIRO_NOME}` | `{EMAIL}` |
|---|---|
| Leo | leo@baxi.ia.br |
| Marcus | marcus@baxi.ia.br |
| Luiz | luiz@baxi.ia.br |
| Lala | lala@baxi.ia.br |

O SES do domínio já está com acesso de produção liberado, então dá para disparar
os quatro pela mesma identidade que manda a newsletter.
