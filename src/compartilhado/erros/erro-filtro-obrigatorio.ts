import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroFiltroObrigatorio extends ErroBase {
  constructor() {
    super('Informe ao menos um filtro: cpf ou nomeCompleto.', 400, 'FILTRO_OBRIGATORIO')
  }
}
