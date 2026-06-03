import type { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'

export interface EntradaCadastrarUsuarioDTO {
  readonly nome: string
  readonly sobrenome: string
  readonly telefone: string
  readonly email: string
  readonly senha: string
  readonly papel: PapelUsuario
  readonly requisitanteId: string
}
