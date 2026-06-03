import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroSetorNaoEncontrado extends ErroBase {
  constructor() {
    super('Setor não encontrado.', 404, 'SETOR_NAO_ENCONTRADO')
  }
}
