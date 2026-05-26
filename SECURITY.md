# Política de Segurança

## Versões suportadas

| Versão | Suporte de segurança |
|--------|----------------------|
| `main` | ✅ Ativa             |

## Reportar uma vulnerabilidade

**Não abra uma issue pública** para vulnerabilidades de segurança.

Use o canal privado do GitHub:
**Security → Report a vulnerability** (aba do repositório)

Inclua no relatório:
- Descrição da vulnerabilidade
- Passos para reproduzir
- Impacto potencial (confidencialidade, integridade, disponibilidade)
- Versão/commit afetado
- Sugestão de correção (opcional)

## Resposta esperada

| Etapa                        | Prazo     |
|------------------------------|-----------|
| Confirmação de recebimento   | 48 horas  |
| Avaliação de severidade      | 5 dias    |
| Correção e divulgação        | 30 dias   |

Vulnerabilidades críticas (CVSS ≥ 9.0) são tratadas com prioridade máxima.

## Escopo

Estão no escopo:
- Injeção de dados (SQL, NoSQL, comando)
- Exposição de dados sensíveis (tokens, senhas, PII)
- Autenticação e autorização quebradas
- Dependências com CVE conhecida

Fora do escopo:
- Ataques de engenharia social
- Problemas em infraestrutura fora do código deste repositório
