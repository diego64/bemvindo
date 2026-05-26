export class ErroBase extends Error {
  readonly statusHttp: number

  constructor(mensagem: string, statusHttp: number) {
    super(mensagem)
    this.name = this.constructor.name
    this.statusHttp = statusHttp
  }
}
