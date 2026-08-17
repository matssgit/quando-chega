# 📦 Quando Chega?

> **Status do Projeto:** 🧊 CONGELADO (Milestone 2.3)
>
> _Este projeto foi temporariamente pausado por uma decisão arquitetural. Leia a seção [ADR (Architecture Decision Record)](#-architecture-decision-record-adr) abaixo para entender o processo de engenharia que levou a essa decisão._

O **Quando Chega?** nasceu com o objetivo de ser uma API de rastreamento de encomendas universal e agnóstica. A premissa era simples: o usuário fornece um código de rastreamento qualquer (Correios, Shopee, Mercado Livre) e o sistema se encarrega de descobrir a transportadora e monitorar os eventos de forma automatizada, notificando as atualizações.

## 🛠️ Stack Tecnológico

O core do projeto foi construído focando em fundamentos sólidos de backend e manutenibilidade:

- **Node.js & TypeScript** (Tipagem estática e segurança)
- **Fastify** (Performance e baixo overhead)
- **PostgreSQL & Knex.js** (Persistência relacional, Migrations e Query Builder)
- **Zod** (Validação de schemas e contratos)
- **Docker & Docker Compose** (Infraestrutura isolada)
- **Arquitetura Limpa:** Padrão Repository, Injeção de Dependências e Factory Pattern.

## 🏗️ O que foi construído (Validado ✅)

A fundação do sistema está completa, validada e funcional através de testes com um `MockProvider`:

- [x] **Banco de Dados:** Modelagem relacional e migrations estruturadas.
- [x] **Core & Serviços:** Lógica de negócio isolada no `SyncShipmentService`.
- [x] **Processamento Assíncrono:** `Scheduler` implementado para consultas periódicas de tracking sem bloquear a thread principal.
- [x] **Inversão de Controle:** Interface `TrackingProvider` abstraída. O núcleo do sistema não conhece a implementação do serviço externo, permitindo plugar e desplugar provedores (Strategy Pattern).
- [x] **Motor de Sincronização:** Algoritmo de deduplicação (Hash) para garantir que eventos logísticos não sejam duplicados no banco.

---

## 🛑 Architecture Decision Record (ADR): A Pausa

**Contexto:**
Para entregar o valor principal do domínio, o sistema depende de um serviço externo (Tracking-as-a-Service) que seja capaz de identificar automaticamente códigos de transportadoras privadas brasileiras (como as malhas da Shopee, Sequoia, etc.) e Correios, de forma gratuita ou viável para um projeto independente.

**Investigações Realizadas (Provas de Conceito Isoladas):**

1.  **Correios (Direto):** ❌ Rejeitado. Bloqueio automatizado e exigência de CAPTCHA.
2.  **Link & Track:** ❌ Rejeitado. Serviço descontinuado.
3.  **Melhor Envio:** ❌ Rejeitado. Incompatibilidade de domínio (rastreia apenas etiquetas geradas dentro da própria plataforma, não códigos externos arbitrários).
4.  **17TRACK:** ❌ Rejeitado. Testes empíricos (PoCs) provaram que o motor de auto-detect da API v2.4 falha ao identificar códigos não-UPU (malhas privadas de e-commerce brasileiro), retornando o erro `-18019903 (Carrier cannot be detected)`.
5.  **TrackingMore / AfterShip:** ❌ Rejeitados por limitações severas de quota gratuita ou modelos estritamente pagos.

**Decisão de Engenharia:**
Em vez de poluir a arquitetura limpa com _web scrapers_ frágeis, bypasses de CAPTCHA ou integrações instáveis que demandariam alta manutenção e quebrariam o isolamento do domínio, **a decisão técnica foi congelar o projeto.**

A arquitetura provou seu valor: o isolamento do `TrackingProvider` permitiu testar e descartar múltiplos serviços externos sem que uma única linha do `SyncShipmentService` ou do banco de dados precisasse ser reescrita.

**Próximos Passos:**
O repositório permanecerá neste estado validado. Caso uma API agnóstica e acessível que atenda ao cenário logístico brasileiro se torne disponível no mercado, o projeto poderá ser retomado instantaneamente apenas implementando o novo provedor concreto sob o contrato da interface `TrackingProvider`.

---

## 💻 Como rodar o ambiente local

Caso queira explorar a arquitetura, o banco de dados e o motor de sincronização (rodando com o `MockProvider`):

```bash
# 1. Clone o repositório
git clone [https://github.com/seu-usuario/quando-chega.git](https://github.com/seu-usuario/quando-chega.git)

# 2. Instale as dependências
npm install

# 3. Suba o banco de dados via Docker
docker-compose up -d

# 4. Rode as migrations
npx knex migrate:latest

# 5. Inicie o servidor
npm run dev
```
