export interface RespostaVisitanteDTO {
  readonly id: string
  readonly codigoVisitante: string
  readonly cpf: string
  readonly nomeCompleto: string
  readonly dataNascimento: string
  readonly telefone: string
  readonly email: string
  readonly setorDestinoId: string
  readonly observacao?: string | undefined
  readonly recepcionistaId: string
  readonly recepcionistaNome: string
  readonly recepcionistaMatricula: string
  readonly criadoEm: string
  readonly atualizadoEm: string
}

export interface RespostaPaginadaVisitanteDTO {
  readonly dados: RespostaVisitanteDTO[]
  readonly paginacao: {
    readonly total: number
    readonly pagina: number
    readonly itensPorPagina: number
    readonly totalPaginas: number
  }
}
