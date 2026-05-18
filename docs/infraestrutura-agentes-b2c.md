# Plataforma de Agentes B2C — BaXiJen

> **Versão:** 1.0 — Baseada na reunião de 06/05/2026
> **Status:** Rascunho para revisão dos sócios
> **Autor:** Marcus Ramalho (CTO) + Milena (PMO)

---

## 1. Conceito

Uma plataforma própria da BaXiJen para provisionar, operar e monitorar agentes de IA generativa para clientes B2C e B2B. Cada cliente roda em ambiente isolado (container), com guardrails, controle de custo, e integração com WhatsApp via BSP.

**Exemplos de agentes:**
- Bot de atendimento da Oficina (e-commerce, WhatsApp)
- Papagaio (voice cloning iOS + backend)
- Chatbot PME (atendimento autônomo sem código)
- Agente de gestão pública (BXat para prefeituras/órgãos)

---

## 2. Princípios de Design

1. **Container por cliente** — isolamento total: cada tenant é um container Docker com seu Open WebUI, seu banco, suas tools
2. **Negar por padrão, liberar incremental** — agente nasce sem permissão destrutiva
3. **Human-in-the-loop obrigatório** — operações que custam dinheiro real ou modificam estado exigem aprovação
4. **Custo visível e limitado** — toda ação tem budget, toda ultrapassagem alerta
5. **Infra própria, WhatsApp terceirizado** — a plataforma é nossa; a conectividade com WhatsApp vai via BSP (360dialog)
6. **Soberania do cliente** — dados ficam isolados; cliente pode auditar seu container

---

## 3. Arquitetura

### 3.1 Diagrama

```
┌──────────────────────────────────────────────────────┐
│                 Plataforma BaXiJen                     │
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Tenant A │  │ Tenant B │  │ Tenant C │   ...       │
│  │ (Oficina)│  │ (Cliente)│  │ (Cliente)│             │
│  │          │  │          │  │          │             │
│  │ Docker   │  │ Docker   │  │ Docker   │             │
│  │ OpenWUI  │  │ OpenWUI  │  │ OpenWUI  │             │
│  │ + engine │  │ + engine │  │ + engine │             │
│  │ + Nemo   │  │ + Nemo   │  │ + Nemo   │             │
│  │ + tools  │  │ + tools  │  │ + tools  │             │
│  │ + DB     │  │ + DB     │  │ + DB     │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       │             │             │                    │
│  ┌────┴─────────────┴─────────────┴────┐               │
│  │        API Gateway / Router          │               │
│  │    (FastAPI + Nginx)                 │               │
│  └────┬────────────────────────────┬───┘               │
│       │                            │                   │
│  ┌────┴────────┐          ┌───────┴──────────┐        │
│  │ Shared Layer │          │ Observabilidade  │        │
│  │ - LLM Pool   │          │ - Langfuse        │        │
│  │ - Cache      │          │ - Dashboard       │        │
│  │ - Logs       │          │ - Alertas         │        │
│  │ - BSP Conn.  │          └──────────────────┘        │
│  └────┬────────┘                                       │
└───────┼────────────────────────────────────────────────┘
        │
   ┌────┴────┐
   │ 360dialog │  ← WhatsApp Cloud API (zero markup)
   │ (BSP)     │
   └────┬────┘
        │
   [ WhatsApp ] → Usuário final
```

### 3.2 Componentes

| Camada | Tecnologia | Função |
|---|---|---|
| **Orquestrador** | Docker Compose / k8s (futuro) | Cria e gerencia containers por cliente |
| **Tenant** | Docker container | Open WebUI + BXat-engine + NeMo + tools + DB próprio |
| **API Gateway** | FastAPI + Nginx | Roteia tráfego pro container certo, autentica, rate-limit |
| **LLM Pool** | Ollama Cloud / Together API | Pool compartilhado de modelos, cada container consome via API key própria |
| **Auth** | Supabase Auth (por tenant) | Login do cliente e dos usuários finais isolado por tenant |
| **Guardrails** | NeMo Guardrails | Input/output/execution filtering por tenant |
| **Approval Queue** | Redis (BullMQ) | Fila de ações destrutivas aguardando supervisor |
| **Agente Supervisor** | LLM interno + regras | Aprova ou rejeita ações destrutivas automaticamente abaixo de limite |
| **BSP Connector** | SDK 360dialog | Abstrai envio/recebimento de WhatsApp |
| **Observabilidade** | Langfuse + Grafana (ou BaXiJen Dashboard) | Métricas, logs, custos por tenant |
| **Deploy** | VPS Hostinger (principal) + Vercel (landings/marketing) | Infra já operacional |

---

## 4. Container por Cliente

### 4.1 O que vai em cada container

```
/app
├── open-webui/          # UI do agente (fork BXat)
├── bxat-engine/         # Motor proprietário (tools + modelo + prompts)
├── nemo-config/         # Configuração de guardrails do cliente
├── tools/               # MCP servers habilitados pra esse cliente
├── .env                 # API keys, secrets do cliente
└── data/                # Volume persistente (upload, docs, DB local)
```

### 4.2 Isolamento

- **Rede:** cada container tem rede interna; só o gateway expõe pra fora
- **Dados:** volume Docker isolado por cliente (ou subpath se pasta compartilhada)
- **DB:** SQLite local (simples) ou schema próprio no Supabase (se shared DB)
- **Logs:** coletados via Docker driver → sistema central de logs
- **Resources:** CPU/RAM limits por container (Docker resource constraints)

### 4.3 Provisionamento (fluxo)

```
[ BaXiJen Dashboard ]
       │ "Criar novo tenant"
       ▼
[ Script de provisionamento ]
  1. Gera UUID do tenant
  2. Cria docker-compose snippet com ports, env vars, volumes
  3. Sobe container
  4. Registra no gateway (nova rota)
  5. Provisiona número WhatsApp via 360dialog API (se contratado)
  6. Retorna URL de acesso + credenciais iniciais
```

---

## 5. WhatsApp — Conexão via BSP

### 5.1 Modelo: BSP intermediário

A BaXiJen **não** é BSP direta do Meta. A gente usa um BSP existente:

| BSP avaliado | Custo | Markup | Fit |
|---|---|---|---|
| **360dialog** | ~US$ 99/mês/número | Zero | ✅ Melhor fit: multi-tenant nativo, zero markup |
| Take | R$ 99+/mês | 10-20% | Alternativa BR |
| Gupshup | Variável | Baixo em volume | Escala global |

**Recomendação: 360dialog** — zero markup, SDK maduro, e quando a BaXiJen crescer, migrar pra Tech Provider direto fica fácil.

### 5.2 Preços Meta Brasil (2026 — por mensagem template)

| Tipo | Mensagem | Custo (Meta) |
|---|---|---|
| Marketing | Promoções, ofertas, novidades | ~R$ 0,35 |
| Utilitário | Pedido confirmado, rastreio, lembrete | ~R$ 0,21 |
| Autenticação | OTP, 2FA | ~R$ 0,21 |
| Serviço | Resposta ao cliente (janela 24h) | **Grátis** |

Com 360dialog: paga só o preço Meta + US$ 99 fixo. Sem surpresa.

### 5.3 Fluxo WhatsApp

```
[ Cliente envia msg → WhatsApp ]
       │
       ▼
[ 360dialog webhook ]
       │
       ▼
[ BaXiJen Gateway ]
       │  roteia pelo número de origem → tenant correto
       ▼
[ Container do cliente ]
       │
       ├──► NeMo (filtra input)
       ├──► BXat-engine (processa com LLM + tools)
       ├──► Se ação é destrutiva → Approval Queue
       └──► Resposta → Gateway → 360dialog → WhatsApp
```

---

## 6. Guardrails e Operações Destrutivas

### 6.1 Classificação de tools

| Classificação | Exemplos | Requer |
|---|---|---|
| **Safe (leitura)** | buscar_produto, consultar_pedido, verificar_estoque | Nada |
| **Semi-destrutiva** | enviar_email_unico, criar_cupom_10% | Supervisor automático |
| **Destrutiva** | enviar_campanha_massa, whatsapp_broadcast, cancelar_pedido | **Aprovação humana** |

### 6.2 Thresholds de aprovação

| Ação | Auto-aprova (Limite) | Requer humano (acima) |
|---|---|---|
| E-mail individual | ≤ 10 destinatários | > 10 |
| WhatsApp individual | ≤ 1 (só respostas) | > 1 (broadcast) |
| Modificação estoque | ≤ 1 item | > 1 (batch) |
| Desconto | ≤ 10% | > 10% |
| Cancelamento | ≤ 1 pedido | > 1 |

### 6.3 Fluxo de aprovação

```
[ Agente decide executar ação ]
        │
        ▼
[ NeMo intercepta e classifica ]
        │
        ├── Safe → Executa direto ✅
        │
        ├── Semi-destrutiva (abaixo limite)
        │      │
        │      ▼
        │   [ Agente Supervisor ] → Aprova/Rejeita ✅/❌
        │
        └── Destrutiva (acima limite)
               │
               ▼
            [ Fila de Aprovação ]
               │  Notifica Slack/WhatsApp
               ▼
            [ Humano aprova/rejeita ]
```

---

## 7. Multi-Tenancy e Dados

### 7.1 Onde os dados vivem

| Dado | Local | Isolamento |
|---|---|---|
| Conversas do agente | DB local do container | Container-level |
| Documentos/arquivos | Volume Docker | Container-level |
| Leads e CRM | Supabase schema por tenant (RLS) | Row-level |
| Logs e métricas | Langfuse central | Tag por tenant_id |
| Configs/senhas | .env do container + Vault (futuro) | Container-level |

### 7.2 Configuração por tenant (exemplo Oficina)

```yaml
tenant_id: "oficina-ia"
display_name: "Oficina IA"
whatsapp:
  provider: "360dialog"
  phone_number: "+5521XXXXXXXX"
  webhook_secret: "wh_..."
llm:
  provider: "ollama_cloud"
  model: "glm-4"
  max_tokens: 4096
guardrails:
  config_file: "oficina-nemo-v1"
tools:
  safe: [search_products, check_order_status, customer_info]
  semi_destructive: [send_single_email, create_coupon_10pct]
  destructive: [send_campaign, whatsapp_broadcast, modify_stock]
budget:
  monthly_limit_brl: 1000  # WhatsApp + LLM
  max_single_action_brl: 50
limits:
  cpu: "2"
  memory: "2Gi"
  disk: "10Gi"
```

---

## 8. Observabilidade e Alertas

### 8.1 Métricas por tenant

| Métrica | Alerta se |
|---|---|
| Custo WhatsApp (dia) | > R$ 50/dia |
| Custo LLM (dia) | > R$ 30/dia |
| Tokens por conversa | > 10k em 1 turno |
| Operações bloqueadas por minuto | > 3 |
| Operações destrutivas sem aprovação | ≥ 1 (CRÍTICO) |
| Latência p95 | > 5s |
| Erros 5xx | > 1/min |
| Container CPU > 80% | por > 5min |

### 8.2 Níveis de alerta

- 🔴 **Crítico (imediato):** operação destrutiva sem aprovação → notificação urgente para sócios
- 🟠 **Alto (1h):** orçamento mensal do tenant atingiu 80% → notificar gerente do cliente
- 🟡 **Médio (diário):** guardrail bloqueando acima do normal → ajustar config
- 🟢 **Baixo (semanal):** relatório consolidado → dashboard

---

## 9. Stack Técnica

| Camada | Tecnologia | Por quê |
|---|---|---|
| Containerização | Docker + Docker Compose | Simples, já dominamos |
| Orquestração | Docker Compose → k3s (futuro) | Escala incremental |
| UI do agente | Open WebUI (fork BXat) | Já modificado e operacional |
| Engine IA | BXat-engine (Python/FastAPI) | Proprietário, tool calling, guardrails |
| Guardrails | NeMo Guardrails | Já integrado, maduro |
| Tools | MCP servers (bx-*) | Padrão aberto, cada tool é um microserviço |
| API Gateway | FastAPI + Nginx | Rápido, roteamento por host/path |
| Auth | Supabase Auth | Multi-tenant nativo, RLS |
| DB (leads/CRM) | Supabase (Postgres) | RLS, realtime |
| DB (conversas) | SQLite por container | Simples, isolado, sem custo |
| Fila de aprovação | Redis + BullMQ | Rápido, persistente, retry |
| WhatsApp | 360dialog (BSP) | Zero markup, SDK pronto |
| LLM | Ollama Cloud + Together API | Custo baixo, soberania quando possível |
| Logs/Métricas | Langfuse + Prometheus | Open source, LLM-native |
| Deploy | VPS Hostinger + Vercel (marketing) | Já operacional |

---

## 10. Custos

### 10.1 Infra (por tenant)

| Item | Custo mensal |
|---|---|
| Container (CPU/RAM) | R$ 30-50 (fatia da VPS) |
| Armazenamento (10GB) | ~R$ 10 |
| Backup | ~R$ 5 |
| LLM (via pool) | R$ 100-300 |
| WhatsApp BSP (360dialog) | US$ 99 (~R$ 550) |
| WhatsApp Meta (por msg) | R$ 0,21-0,35/msg (repasse ao cliente) |
| **Total plataforma por tenant** | **~R$ 700-900/mês** |

### 10.2 Infra base (compartilhada, independente de tenants)

| Item | Custo mensal |
|---|---|
| VPS (Hostinger, 8GB RAM) | R$ 200 |
| Domínio (baxijen.com.br) | R$ 70/ano |
| Supabase (free tier → pro) | R$ 0-100 |
| Langfuse (self-hosted) | R$ 0 |
| Redis | R$ 0 (mesmo VPS) |
| **Total base** | **~R$ 350/mês** |

### 10.3 Exemplo: Oficina (com 5.000 conversas/mês)

| Item | Valor |
|---|---|
| Plataforma (tenant) | R$ 750 |
| Mensagens WhatsApp (Meta) | ~R$ 1.000 (5k × R$ 0,20 média) |
| **Total mensal Oficina** | **~R$ 1.750** |

---

## 11. Roadmap

### Fase 1 — Fundação (Maio 2026)
- [ ] Template de container padronizado (Dockerfile base)
- [ ] Script de provisionamento de tenant
- [ ] Gateway de roteamento (FastAPI + Nginx)
- [ ] Integração 360dialog (provisionar número via API)
- [ ] Dashboard simples de tenants

### Fase 2 — Produção (Junho 2026)
- [ ] Container Oficina em produção
- [ ] NeMo com regras de operações destrutivas
- [ ] Approval Queue + Agente Supervisor
- [ ] Alertas críticos (Slack/WhatsApp)
- [ ] Monitoramento básico (CPU, RAM, latência)

### Fase 3 — Escala (Julho-Agosto 2026)
- [ ] Multi-tenant completo (3+ clientes simultâneos)
- [ ] Langfuse integrado
- [ ] Dashboard de métricas e custos
- [ ] Templates de container por vertical (e-commerce, saúde, gov)
- [ ] Migração Docker Compose → k3s (se volume justificar)

### Fase 4 — Plataforma como Produto (Setembro+)
- [ ] Self-service provisionamento (cliente cria seu agente)
- [ ] Marketplace de tools (bx-*)
- [ ] Tech Provider Program Meta (aplicar quando 10+ tenants)
- [ ] Billing e cobrança automatizada

---

## 12. Decisões Registradas (ADR)

### 12.1 Container vs VM vs Serverless
**Decisão:** Container Docker por cliente (não VM, não serverless)
**Motivo:** Isolamento suficiente, baixo overhead, já domina-se Docker, deploy simples na VPS. Migrar pra k3s se volume crescer.

### 12.2 BSP vs API Oficial Direta
**Decisão:** BSP intermediário (360dialog), não Tech Provider direto
**Motivo:** US$ 5k/ano não se justifica com < 10 clientes. Zero markup do 360dialog + migração fácil pra direto quando escalar.

### 12.3 DB por tenant vs DB compartilhado
**Decisão:** Híbrido — SQLite local para conversas do agente; Supabase (RLS) para leads/CRM
**Motivo:** Isolamento de dados sensíveis localmente, sem custo extra de DB por tenant. RLS no Supabase para dados compartilháveis.

### 12.4 Evolution API vs Cloud API
**Decisão:** Evolution API só para lab/testes internos. Cloud API (via BSP) em produção.
**Motivo:** Risco de banimento, instabilidade com updates do WhatsApp, ausência de suporte. Cliente pagante não pode correr esse risco.

---

## 13. Glossário

| Termo | Definição |
|---|---|
| **Tenant** | Cliente isolado na plataforma (ex: Oficina IA, Prefeitura Niterói) |
| **Container** | Unidade de isolamento — cada tenant é um Docker container |
| **BSP** | Business Solution Provider — parceiro autorizado pelo Meta a fornecer WhatsApp API |
| **Operação destrutiva** | Ação com custo financeiro, modificação de estado ou irreversível |
| **Agente Supervisor** | LLM que aprova/rejeita automaticamente ações abaixo de limite |
| **Approval Queue** | Fila de ações pendentes de aprovação humana |
| **Zero markup** | O BSP não cobra taxa extra sobre o preço do Meta |
| **RLS** | Row Level Security — isolamento de dados por tenant no banco |