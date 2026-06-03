export interface RespostaLoginDTO {
  readonly accessToken: string
  readonly refreshTokenCookie: string
  readonly usuario: {
    readonly id: string
    readonly nome: string
    readonly sobrenome: string
    readonly email: string
    readonly papel: string
  }
}

export interface RespostaRenovarTokenDTO {
  readonly accessToken: string
}

export interface RespostaPerfilDTO {
  readonly id: string
  readonly nome: string
  readonly sobrenome: string
  readonly email: string
  readonly papel: string
}
