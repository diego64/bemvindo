export interface RespostaUsuarioDTO {
  readonly id: string
  readonly nome: string
  readonly sobrenome: string
  readonly email: string
  readonly matricula: string
  readonly papel: string
  readonly criadoEm: string
  readonly atualizadoEm: string
}

export interface RespostaListaUsuariosDTO {
  readonly usuarios: RespostaUsuarioDTO[]
  readonly paginacao: {
    readonly total: number
    readonly pagina: number
    readonly itensPorPagina: number
    readonly totalPaginas: number
  }
}
