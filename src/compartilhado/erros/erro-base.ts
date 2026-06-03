export class ErroBase extends Error {
  readonly statusHttp: number
  readonly codigo: string

  constructor(mensagem: string, statusHttp: number, codigo: string) {
    super(mensagem)
    this.name = this.constructor.name
    this.statusHttp = statusHttp
    this.codigo = codigo
  }
}
