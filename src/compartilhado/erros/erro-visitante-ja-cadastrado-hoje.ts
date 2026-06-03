import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroVisitanteJaCadastradoHoje extends ErroBase {
  constructor() {
    super('Visitante já cadastrado hoje.', 409, 'VISITANTE_JA_CADASTRADO_HOJE')
  }
}
