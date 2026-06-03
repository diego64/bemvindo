export interface EntradaAtualizarUsuarioDTO {
  readonly id: string
  readonly nome?: string
  readonly sobrenome?: string
  readonly telefone?: string
  readonly requisitanteId: string
}
