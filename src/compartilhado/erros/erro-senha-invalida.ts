import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroSenhaInvalida extends ErroBase {
  constructor() {
    super('A senha deve ter no mínimo 8 caracteres.', 400, 'SENHA_INVALIDA')
  }
}
