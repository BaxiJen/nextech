# Email de acesso ao painel

Texto final, já verificado contra o painel em produção (build #13, `7bcf30e`).
Versão para o Leo; troque nome e email para os outros três.

Remetente: `BaXiJen <contato@baxi.ia.br>` — mesma identidade SES da newsletter.

**Assunto:** Seu acesso ao painel da BaXiJen

```
Olá, Leo!

O painel de leads da BaXiJen está no ar e você tem acesso.

COMO ENTRAR

1. Abra https://www.baxijen.com.br/admin
2. Digite seu email (leo@baxi.ia.br) e peça o código.
3. Chega um email com um código de 6 dígitos. Digite na mesma tela.

Pronto. Não há senha para criar, guardar ou esquecer. O acesso fica valendo por
7 dias no navegador; depois disso o painel pede um código novo.

O QUE TEM LÁ

- Visão geral: total de leads, quantos entraram nos últimos 7 e 30 dias,
  pipeline por status, score médio e os números da newsletter.
- Leads: busca, filtro por status, exportação em CSV e o histórico de cada
  lead, com mensagem, telefone, empresa e objetivo.
- Mudar o status de um lead fica registrado com o seu nome. Isso é de
  propósito: dá para saber quem moveu o quê e quando, o que antes era
  impossível porque todo mundo usava a mesma senha.

TRÊS DETALHES QUE VALEM SABER

- O código vale por 10 minutos, serve uma vez só e aceita 5 tentativas. Se
  errar demais, é só pedir outro.
- Digitar um email que não está na lista de acesso devolve a mesma resposta e
  não envia nada. É proposital: assim ninguém descobre por tentativa quem tem
  acesso.
- É código digitado, não link para clicar. Pode pedir no computador e ler no
  celular sem problema.

Qualquer coisa estranha - código que não chega, tela que não abre - me chama.

Marcus
```

## Destinatários

| Nome | Email |
|---|---|
| Leo | leo@baxi.ia.br |
| Marcus | marcus@baxi.ia.br |
| Luiz | luiz@baxi.ia.br |
| Lala | lala@baxi.ia.br |

## Como disparar

O envio pela CLI precisa de `ses:SendEmail` na permission set — a role de
operador não tem, e a tentativa em 2026-08-15 voltou `AccessDeniedException`.
O statement `SendFromBaxijenSesIdentity` já está em
`docs/permission-set-kiro-operator.json` esperando ser colado no Identity
Center; com ele aplicado, os quatro saem de `contato@baxi.ia.br` em um comando.
