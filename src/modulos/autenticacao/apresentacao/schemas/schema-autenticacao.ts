import { z } from 'zod'

export const schemaRealizarLogin = z.object({
  email: z.email('Email inválido.'),
  senha: z.string().min(1, 'Senha é obrigatória.'),
})

export const schemaAlterarSenha = z.object({
  senhaAtual: z.string().min(1, 'Senha atual é obrigatória.'),
  novaSenha: z.string().min(8, 'A nova senha deve ter no mínimo 8 caracteres.'),
})

export type RealizarLoginBody = z.infer<typeof schemaRealizarLogin>
export type AlterarSenhaBody = z.infer<typeof schemaAlterarSenha>
