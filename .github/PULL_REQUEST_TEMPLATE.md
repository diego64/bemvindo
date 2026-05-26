## O que foi feito

<!-- Descreva brevemente o que mudou e por quê. Uma frase é suficiente. -->

## Tipo de mudança

- [ ] `feat` — nova funcionalidade
- [ ] `fix` — correção de bug
- [ ] `refactor` — refatoração sem mudança de comportamento
- [ ] `test` — adição ou correção de testes
- [ ] `docs` — documentação
- [ ] `chore` — configuração, dependências, CI

---

## Checklist

### Código
- [ ] Todo o código está em PT-BR (variáveis, funções, classes, mensagens)
- [ ] Nenhum uso de `any` no TypeScript
- [ ] Imports absolutos com alias `@/` — sem `../`
- [ ] Interfaces sem prefixo `I`

### Arquitetura
- [ ] Nenhuma regra de negócio em controller ou repositório
- [ ] Todas as dependências injetadas via construtor
- [ ] DTOs de entrada e saída separados, campos `readonly`
- [ ] Entidade de domínio não retornada diretamente na resposta HTTP

### Domínio e persistência
- [ ] Campos de auditoria presentes (`criadoEm`, `atualizadoEm`, `criadoPor`, `atualizadoPor`)
- [ ] Datas persistidas em UTC com `new Date()`
- [ ] Dados normalizados antes de persistir (email lowercase, identificadores sem máscara)
- [ ] Erros lançados com classes customizadas (`extends ErroBase`)
- [ ] Respostas no formato padrão (`{ sucesso, dados }` ou `{ sucesso, erro }`)

### Segurança
- [ ] Nenhum dado sensível logado (senha, token JWT, refresh token, headers de auth)
- [ ] Nenhum campo `senha` ou `senhaHash` exposto na resposta
- [ ] Novas variáveis de ambiente documentadas no `.env.example`

### Qualidade
- [ ] `pnpm lint` passando sem erros
- [ ] `pnpm typecheck` passando sem erros
- [ ] `pnpm test` passando
- [ ] Cada caso de uso tem ao menos um teste de sucesso e um de falha

### Git
- [ ] Mensagens de commit no formato `tipo: descrição em PT-BR`
- [ ] Sem menção a ferramentas de IA ou automação nos commits
