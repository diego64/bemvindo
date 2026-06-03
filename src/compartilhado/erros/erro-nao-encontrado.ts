import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroNaoEncontrado extends ErroBase {
  constructor(recurso = 'Recurso') {
    super(`${recurso} não encontrado.`, 404, 'NAO_ENCONTRADO')
  }
}
