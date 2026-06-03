import { z } from 'zod'

export const schemaCadastrarSetor = z.object({
  nome: z.string().min(2, 'Nome do setor deve ter no mínimo 2 caracteres.'),
})

export type CadastrarSetorBody = z.infer<typeof schemaCadastrarSetor>
