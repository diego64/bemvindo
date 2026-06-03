export interface EntradaCadastrarVisitanteDTO {
  readonly nomeCompleto: string
  readonly cpf: string
  readonly dataNascimento: string
  readonly telefone: string
  readonly email: string
  readonly setorDestinoId: string
  readonly observacao?: string | undefined
  readonly requisitanteId: string
}
