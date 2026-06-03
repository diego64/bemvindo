import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroSenhaAtualIncorreta extends ErroBase {
  constructor() {
    super('Senha atual incorreta.', 400, 'SENHA_ATUAL_INCORRETA')
  }
}
