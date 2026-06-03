import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroNaoAutenticado extends ErroBase {
  constructor() {
    super('Não autenticado.', 401, 'NAO_AUTENTICADO')
  }
}
