import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroCredenciaisInvalidas extends ErroBase {
  constructor() {
    super('Email ou senha incorretos.', 401, 'CREDENCIAIS_INVALIDAS')
  }
}
