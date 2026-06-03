import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroTokenInvalido extends ErroBase {
  constructor() {
    super('Token inválido ou expirado.', 401, 'TOKEN_INVALIDO')
  }
}
