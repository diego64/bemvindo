<div align="center">
  <h1>Bem-vindo</h1>
  <p>Sistema de recepção corporativa para controle de entrada de visitantes</p>
</div>

---

## Visão geral

**Bem-vindo** é uma API REST para gestão de entrada de visitantes em ambientes corporativos. Recepcionistas registram visitas em tempo real; administradores acompanham o histórico e geram relatórios. O sistema aplica regras de negócio rigorosas — horário comercial, unicidade de CPF por dia, restrição de edição — e expõe observabilidade completa via Grafana e Loki.

## Arquitetura

![Diagrama de arquitetura do sistema Bem-vindo](image/bemvindo-estrutura.png)

O fluxo parte do frontend, passa pela camada de autenticação JWT, persiste no MongoDB e emite eventos que alimentam notificações, relatórios e dashboards Grafana.

O projeto segue **monólito modular com DDD e Clean Architecture**:

```
src/modulos/{dominio}/
├── dominio/       # entidades, value objects, interfaces — sem dependência externa
├── aplicacao/     # casos de uso e DTOs — orquestra o domínio
├── infra/         # repositórios MongoDB, Redis — implementa as interfaces
└── apresentacao/  # controllers Fastify, schemas Zod, rotas
```

| Módulo          | Responsabilidade                                |
|-----------------|-------------------------------------------------|
| `autenticacao`  | Login, refresh token, logout, alterar senha     |
| `usuarios`      | CRUD de recepcionistas e administradores        |
| `visitantes`    | Cadastro, edição e histórico de visitas         |
| `setores`       | Gestão dos setores de destino dos visitantes    |

## Stack

| Categoria        | Tecnologia                          |
|------------------|-------------------------------------|
| Runtime          | Node.js 22 LTS                      |
| Linguagem        | TypeScript 6 (strict)               |
| Framework HTTP   | Fastify 5                           |
| Banco de dados   | MongoDB 8 (driver nativo, sem ORM)  |
| Cache            | Redis 8 via ioredis                 |
| Validação        | Zod 4                               |
| Testes           | Vitest 4                            |
| Observabilidade  | Grafana 13 + Loki 3 + Promtail      |
| Empacotamento    | tsup (esbuild)                      |

## Pré-requisitos

- [Node.js](https://nodejs.org) >= 22
- [pnpm](https://pnpm.io) >= 10
- [Docker](https://www.docker.com) e Docker Compose

## Rodando localmente

### 1. Clone o repositório

```bash
git clone https://github.com/diego64/bemvindo.git
cd bemvindo
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com as credenciais locais. Para o ambiente Docker padrão:

```env
PORTA=3000
NODE_ENV=development
LOG_FORMATO=pretty

JWT_SECRETO=       # mínimo 32 chars — gere com o comando abaixo
JWT_EXPIRACAO_ACCESS=1h
JWT_EXPIRACAO_REFRESH=7d

MONGO_USUARIO=administrador
MONGO_SENHA=1qaz2sx12
MONGO_URI=mongodb://administrador:1qaz2sx12@bv-mongodb:27017/bem-vindo?authSource=admin

REDIS_USUARIO=administrador
REDIS_SENHA=1qaz2sx12
REDIS_URL=redis://administrador:1qaz2sx12@bv-redis:6379

TZ=America/Sao_Paulo
CORS_ORIGENS=http://localhost:5173

GRAFANA_USUARIO=administrador
GRAFANA_SENHA=1qaz2sx12
```

Para gerar o `JWT_SECRETO`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Suba os containers

```bash
docker compose up -d
```

Isso inicia a API, MongoDB, Redis, Loki, Promtail e Grafana. Aguarde os health checks passarem (cerca de 30 segundos na primeira vez).

### 4. Popule o banco com dados iniciais

```bash
pnpm seed
```

Cria um usuário administrador padrão (`administrador` / `1qaz2sx12`) e alguns setores de exemplo.

### 5. Acesse a API

| Serviço       | URL                                          |
|---------------|----------------------------------------------|
| API           | http://localhost:3000                        |
| Documentação  | http://localhost:3000/documentacao           |
| Grafana       | http://localhost:3001 (admin / 1qaz2sx12)    |

## Scripts disponíveis

```bash
pnpm dev              # servidor em modo watch com hot-reload
pnpm build            # empacota para dist/ via tsup
pnpm start            # executa o build compilado
pnpm lint             # ESLint sobre src/
pnpm typecheck        # TypeScript strict sem emissão
pnpm test             # Vitest — todos os testes
pnpm test:watch       # Vitest em modo interativo
pnpm test:coverage    # Vitest com relatório de cobertura (mín. 80%)
pnpm seed             # popula o banco com dados iniciais
pnpm seed:limpar      # remove todos os dados de seed
```

## Testes

O projeto segue a pirâmide de testes com cobertura mínima de **80%** global e **90%** para domínio crítico.

```bash
# rodar todos os testes
pnpm test

# rodar apenas unitários
pnpm exec vitest run src/testes/unitarios

# rodar apenas E2E (requer MongoDB e Redis ativos)
pnpm exec vitest run src/testes/e2e

# relatório de cobertura
pnpm test:coverage
```

| Camada       | Localização                  | Infraestrutura necessária |
|--------------|------------------------------|---------------------------|
| Unitários    | `src/testes/unitarios/`      | Nenhuma                   |
| E2E          | `src/testes/e2e/`            | MongoDB + Redis            |

## Regras de negócio principais

- Cadastro de visitantes permitido apenas entre **08:00 e 16:59 (BRT)**, de segunda a sexta, exceto feriados nacionais
- O mesmo CPF não pode ser cadastrado mais de uma vez **por dia calendário**
- **Recepcionista** pode editar um registro em até **30 minutos** após o cadastro
- **Administrador** pode editar sem restrição de tempo
- Nenhuma role pode **excluir** registros — todos os dados são permanentes

## Variáveis de ambiente

| Variável              | Obrigatório | Descrição                                      |
|-----------------------|-------------|------------------------------------------------|
| `PORTA`               | não         | Porta HTTP (padrão: `3000`; Render usa `PORT`) |
| `NODE_ENV`            | não         | `development`, `production` ou `test`          |
| `JWT_SECRETO`         | **sim**     | Chave de assinatura JWT (mín. 32 chars)        |
| `JWT_EXPIRACAO_ACCESS`| não         | Expiração do access token (padrão: `1h`)       |
| `MONGO_URI`           | **sim**     | URI de conexão com o MongoDB                   |
| `REDIS_URL`           | **sim**     | URL de conexão com o Redis                     |
| `TZ`                  | não         | Timezone (padrão: `America/Sao_Paulo`)         |
| `CORS_ORIGENS`        | não         | Origens CORS separadas por vírgula             |
| `LOG_FORMATO`         | não         | `pretty` (local) ou vazio para JSON            |

## Deploy

A API está disponível em produção em:

```
https://bemvindo-njrj.onrender.com
```

O pipeline de release é acionado automaticamente ao criar uma tag `v*.*.*`:

```bash
git tag v1.0.0
git push origin v1.0.0
```

O workflow executa: build → lint → typecheck → testes unitários → testes E2E → cobertura → security scan → **aprovação manual** → push da imagem Docker → criação do GitHub Release.

A imagem Docker está publicada em: [`docker.io/diego64/bemvindo`](https://hub.docker.com/r/diego64/bemvindo)

```bash
docker pull diego64/bemvindo:latest
```

## CI/CD

| Workflow   | Gatilho                    | Etapas                                                   |
|------------|----------------------------|----------------------------------------------------------|
| `ci.yml`   | PR e push em `main`        | build → lint → typecheck → unitários → E2E → cobertura → Dockerfile |
| `release.yml` | Tag `v*.*.*`            | ci completo → security scan → aprovação → Docker Hub → GitHub Release |

## Coleção Postman

Uma coleção Postman com todos os endpoints está disponível em [`bem-vindo.postman_collection.json`](bem-vindo.postman_collection.json).

Importe no Postman ou Insomnia e configure a variável `baseUrl` para `http://localhost:3000`.

## Contribuindo

1. Fork o repositório
2. Crie uma branch: `git checkout -b feat/minha-feature`
3. Faça as alterações seguindo os padrões do projeto (`pnpm lint && pnpm typecheck && pnpm test`)
4. Commit com mensagem convencional: `feat: descrição no imperativo`
5. Abra um Pull Request para `main`

Mensagens de commit seguem o padrão [Conventional Commits](https://www.conventionalcommits.org) com tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.

## Segurança

Vulnerabilidades devem ser reportadas pelo canal privado do GitHub:
**Security → Report a vulnerability**

Não abra issues públicas para problemas de segurança. Consulte a [política de segurança](SECURITY.md) para prazos de resposta e escopo.

## Licença

Proprietário — uso interno. Todos os direitos reservados.
