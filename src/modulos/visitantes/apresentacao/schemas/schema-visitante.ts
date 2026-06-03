import { z } from 'zod'

export const schemaCadastrarVisitante = z.object({
  nomeCompleto: z.string().min(3, 'Nome completo deve ter no mínimo 3 caracteres.'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00.'),
  dataNascimento: z.iso.date('Data de nascimento inválida.'),
  telefone: z.string().min(10, 'Telefone deve ter no mínimo 10 dígitos.'),
  email: z.email('E-mail inválido.'),
  setorDestinoNome: z.string().min(2, 'Nome do setor deve ter no mínimo 2 caracteres.'),
  observacao: z.string().optional(),
})

export const schemaEditarVisitante = z
  .object({
    nomeCompleto: z.string().min(3).optional(),
    telefone: z.string().min(10).optional(),
    email: z.email().optional(),
    dataNascimento: z.iso.date().optional(),
    setorDestinoId: z.string().length(24).optional(),
    observacao: z.string().nullable().optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: 'Ao menos um campo deve ser informado para edição.',
  })

export const schemaListarVisitantesHoje = z.object({
  setorDestinoId: z.string().length(24).optional(),
  nomeCompleto: z.string().optional(),
  pagina: z.coerce.number().int().min(1).default(1),
  itensPorPagina: z.coerce.number().int().min(1).max(100).default(20),
})

export const schemaBuscarHistoricoVisitante = z
  .object({
    cpf: z.string().optional(),
    nomeCompleto: z.string().optional(),
    pagina: z.coerce.number().int().min(1).default(1),
    itensPorPagina: z.coerce.number().int().min(1).max(100).default(20),
  })
  .refine((d) => d.cpf !== undefined || d.nomeCompleto !== undefined, {
    message: 'Informe ao menos um filtro: cpf ou nomeCompleto.',
  })

export type CadastrarVisitanteBody = z.infer<typeof schemaCadastrarVisitante>
export type EditarVisitanteBody = z.infer<typeof schemaEditarVisitante>
export type ListarVisitantesHojeQuery = z.infer<typeof schemaListarVisitantesHoje>
export type BuscarHistoricoVisitanteQuery = z.infer<typeof schemaBuscarHistoricoVisitante>
