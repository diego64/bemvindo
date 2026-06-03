import { z } from 'zod'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'

export const schemaCadastrarUsuario = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.'),
  sobrenome: z.string().min(2, 'Sobrenome deve ter no mínimo 2 caracteres.'),
  telefone: z.string().min(1, 'Telefone é obrigatório.'),
  email: z.email('Email inválido.'),
  senha: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
  papel: z.enum(PapelUsuario).default(PapelUsuario.RECEPCIONISTA),
})

export const schemaAtualizarUsuario = z
  .object({
    nome: z.string().min(2).optional(),
    sobrenome: z.string().min(2).optional(),
    telefone: z.string().min(1).optional(),
  })
  .refine(
    (dados) =>
      dados.nome !== undefined || dados.sobrenome !== undefined || dados.telefone !== undefined,
    { message: 'Informe ao menos um campo para atualizar.' },
  )

export const schemaPaginacao = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  itensPorPagina: z.coerce.number().int().min(1).max(100).default(20),
})

export type CadastrarUsuarioBody = z.infer<typeof schemaCadastrarUsuario>
export type AtualizarUsuarioBody = z.infer<typeof schemaAtualizarUsuario>
export type PaginacaoQuery = z.infer<typeof schemaPaginacao>
