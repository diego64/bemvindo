import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroDiaNaoPermitido extends ErroBase {
  constructor() {
    super('Cadastro não permitido em fins de semana ou feriados nacionais.', 403, 'DIA_NAO_PERMITIDO')
  }
}
