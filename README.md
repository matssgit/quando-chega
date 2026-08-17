# 📦 Quando Chega?

> **Status do Projeto:** 🧊 CONGELADO (Milestone 2.3)
>
> _O projeto está funcional em seu núcleo, porém não possui integração com um provedor real de rastreamento._
> _Este projeto foi temporariamente pausado por uma decisão arquitetural. Leia a seção [ADR (Architecture Decision Record)](#-architecture-decision-record-adr-a-pausa) abaixo para entender o processo de engenharia que levou a essa decisão._

O **Quando Chega?** nasceu com o objetivo de ser uma API de rastreamento de encomendas universal e agnóstica. A premissa era simples: o usuário fornece um código de rastreamento qualquer (Correios, Shopee, Mercado Livre) e o sistema se encarrega de descobrir a transportadora e monitorar os eventos de forma automatizada, notificando as atualizações.

## 🎯 O que este projeto demonstra

Este projeto foi desenvolvido como um exercício prático de engenharia de software, com foco em backend e tomada de decisões arquiteturais.

Entre os principais conceitos aplicados:

- Modelagem e persistência com PostgreSQL
- Migrations com Knex.js
- APIs REST com Fastify
- Validação de entrada com Zod
- Injeção de dependências
- Programação orientada a interfaces
- Repository Pattern
- Factory Pattern
- Jobs em background
- Controle de concorrência
- Idempotência
- Deduplicação baseada em SHA-256
- Integração e avaliação de APIs externas através de PoCs
- Tomada de decisão arquitetural baseada em evidências

## 🛠️ Stack Tecnológico

O core do projeto foi construído focando em fundamentos sólidos de backend e manutenibilidade:

- **Node.js & TypeScript** (Tipagem estática e segurança)
- **Fastify** (Performance e baixo overhead)
- **PostgreSQL & Knex.js** (Persistência relacional, Migrations e Query Builder)
- **Zod** (Validação de schemas e contratos)
- **Docker & Docker Compose** (Infraestrutura isolada)
- **Arquitetura modular:** Repository Pattern, Injeção de Dependências e Factory Pattern.

## 🏗️ O que foi construído (Validado ✅)

A fundação do sistema está completa, validada e funcional através de testes com um `MockProvider`:

- [x] **Banco de Dados:** Modelagem relacional e migrations estruturadas.
- [x] **Core & Serviços:** Lógica de negócio isolada no `SyncShipmentService`.
- [x] **Processamento Assíncrono:** `Scheduler` implementado para consultas periódicas de tracking sem bloquear a thread principal.
- [x] **Inversão de Controle:** Interface `TrackingProvider` abstraída. O núcleo do sistema não conhece a implementação do serviço externo, permitindo plugar e desplugar provedores (Strategy Pattern).
- [x] **Motor de Sincronização:** Algoritmo de deduplicação (Hash) para garantir que eventos logísticos não sejam duplicados no banco.

---

## 🔬 Processo de Investigação

Antes de implementar qualquer integração definitiva, foram realizadas Provas de Conceito (PoCs) isoladas para validar a viabilidade técnica dos serviços externos.

As PoCs foram deliberadamente mantidas fora do código de produção, permitindo avaliar autenticação, disponibilidade, formato das respostas, limitações e compatibilidade com o domínio sem contaminar a arquitetura principal.

Esse processo resultou no descarte sucessivo de diferentes provedores, até a decisão de congelar o projeto.

---

## 🛑 Architecture Decision Record (ADR): A Pausa

**Contexto:**
Para entregar o valor principal do domínio, o sistema depende de um serviço externo (Tracking-as-a-Service) que seja capaz de identificar automaticamente códigos de transportadoras privadas brasileiras (como as malhas da Shopee, Sequoia, etc.) e Correios, de forma gratuita ou viável para um projeto independente.

**Investigações Realizadas (Provas de Conceito Isoladas):**

1.  **Correios (Direto):** ❌ Rejeitado. Bloqueio automatizado e exigência de CAPTCHA.
2.  **Link & Track:** ❌ Rejeitado. Serviço descontinuado.
3.  **Melhor Envio:** ❌ Rejeitado. Incompatibilidade de domínio (rastreia apenas etiquetas geradas dentro da própria plataforma, não códigos externos arbitrários).
4.  **17TRACK:** ❌ Rejeitado. Testes empíricos (PoCs) provaram que a versão testada da API não conseguiu detectar os códigos privados brasileiros utilizados nos cenários da PoC quando apenas o código de rastreamento foi fornecido.
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
git clone [https://github.com/matssgit/quando-chega.git](https://github.com/matssgit/quando-chega.git)

# 2. Entre no backend
cd quando-chega/backend

# 3. Instale as dependências
npm install

# 4. Suba o PostgreSQL
cd ..
docker compose up -d

# 5. Volte para o backend
cd backend

# 6. Rode as migrations
npx knex migrate:latest

# 7. Inicie o servidor
npm run dev
```
