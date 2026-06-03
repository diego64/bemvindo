import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroVisitanteNaoEncontrado extends ErroBase {
  constructor() {
    super('Visitante não encontrado.', 404, 'VISITANTE_NAO_ENCONTRADO')
  }
}
