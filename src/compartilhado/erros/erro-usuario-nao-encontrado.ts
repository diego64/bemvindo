import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroUsuarioNaoEncontrado extends ErroBase {
  constructor() {
    super('Usuário não encontrado.', 404, 'USUARIO_NAO_ENCONTRADO')
  }
}
