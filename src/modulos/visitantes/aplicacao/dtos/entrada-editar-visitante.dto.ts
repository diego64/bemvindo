import type { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'

export interface EntradaEditarVisitanteDTO {
  readonly id: string
  readonly nomeCompleto?: string | undefined
  readonly telefone?: string | undefined
  readonly email?: string | undefined
  readonly dataNascimento?: string | undefined
  readonly setorDestinoId?: string | undefined
  readonly observacao?: string | null | undefined
  readonly requisitanteId: string
  readonly papel: PapelUsuario
}
