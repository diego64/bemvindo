import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroEmailInvalido extends ErroBase {
  constructor() {
    super('Email inválido.', 400, 'EMAIL_INVALIDO')
  }
}
