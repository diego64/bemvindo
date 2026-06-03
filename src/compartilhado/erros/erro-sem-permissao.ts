import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroSemPermissao extends ErroBase {
  constructor() {
    super('Sem permissão para realizar esta ação.', 403, 'SEM_PERMISSAO')
  }
}
