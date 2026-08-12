# DynamoDB no AWS Amplify (produção)

A aplicação usa o AWS SDK no runtime SSR do Amplify. A autenticação é feita por
credenciais temporárias da **SSR Compute role**; não crie access keys e não
adicione `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` às variáveis do Amplify.

## Recursos

O template [`infra/dynamodb.yml`](../infra/dynamodb.yml) cria em `sa-east-1`:

| Recurso | Nome padrão | Uso |
|---|---|---|
| DynamoDB | `baxijen-prod-leads` | Upsert por email, busca por ID, lista por data |
| DynamoDB | `baxijen-prod-chat-history` | Mensagens por sessão, vínculo por lead, TTL |
| DynamoDB | `baxijen-prod-interactions` | Eventos por lead |
| DynamoDB | `baxijen-prod-newsletter` | Inscrições por email e confirmação por token |
| IAM role | `baxijen-prod-amplify-ssr-dynamodb` | Privilégio mínimo para as quatro tabelas |

Todas as tabelas usam cobrança on-demand, criptografia, recuperação point-in-time,
proteção contra exclusão e `DeletionPolicy: Retain`. O histórico expira após 180
dias (o DynamoDB remove itens por TTL de forma assíncrona).

## 1. Criar a stack

1. Abra **AWS CloudFormation** na região **South America (São Paulo), `sa-east-1`**.
2. Escolha **Create stack > With new resources**.
3. Selecione **Upload a template file** e envie `infra/dynamodb.yml`.
4. Nome da stack: `baxijen-prod-data`.
5. Parâmetros: mantenha `ProjectName=baxijen` e `Environment=prod`.
6. Em *Capabilities*, marque a confirmação para criação de recurso IAM com nome
   personalizado (`CAPABILITY_NAMED_IAM`).
7. Crie a stack e aguarde `CREATE_COMPLETE`.
8. Na aba **Outputs**, confirme:
   - `TablePrefix = baxijen-prod`
   - `AmplifySsrComputeRoleArn = arn:aws:iam::...:role/baxijen-prod-amplify-ssr-dynamodb`

## 2. Anexar a role ao Amplify

1. Abra **AWS Amplify > BaXiJen > App settings > IAM roles**.
2. Em **Compute role**, escolha **Edit**.
3. Preferencialmente selecione a branch de produção `main` (em vez de liberar
   previews/branches automáticas).
4. Selecione `baxijen-prod-amplify-ssr-dynamodb` e salve.

A alteração da Compute role é imediata e não requer access key. O próximo deploy
usará o provider padrão do SDK para receber as credenciais temporárias.

## 3. Variáveis do Amplify

Em **Hosting > Environment variables**, defina:

```text
ADMIN_USERNAME=<usuario-do-painel>
ADMIN_PASSWORD=<senha-longa-unica>
```

Use pelo menos 20 caracteres aleatórios na senha. O painel `/admin` e todas as
rotas `/api/admin/*` falham fechado (HTTP 503) quando essas variáveis não existem
e usam HTTP Basic quando estão configuradas.

O `amplify.yml` versionado grava no runtime SSR:

```text
DYNAMODB_REGION=sa-east-1
DYNAMODB_TABLE_PREFIX=baxijen-prod
CHAT_RETENTION_DAYS=180
```

Não são necessários endpoints ou credenciais do Supabase.

## 4. Ordem segura de publicação

1. Criar a stack e aguardar `CREATE_COMPLETE`.
2. Anexar a Compute role à branch `main`.
3. Definir `ADMIN_USERNAME` e `ADMIN_PASSWORD`.
4. Só então publicar o commit da migração.
5. Validar chat, newsletter e `/admin` em produção.

Essa ordem evita publicar o código antes de ele ter tabelas e permissão.

## Segurança e rollback

- A role permite apenas as operações DynamoDB usadas pela aplicação e somente
  nas quatro tabelas/índices criados pela stack.
- Não exponha variáveis `AWS_*` nem retorne erros/credenciais pelas APIs.
- Para bloquear imediatamente o acesso ao banco, remova a Compute role no
  Amplify. Isso não apaga dados.
- Remover a stack não apaga as tabelas devido a `Retain` e à proteção contra
  exclusão. A exclusão de dados precisa ser uma ação deliberada separada.
