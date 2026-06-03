import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroVisitanteNaoPodeSerEditado extends ErroBase {
  constructor() {
    super('Edição permitida apenas até 30 minutos após o cadastro.', 403, 'VISITANTE_NAO_PODE_SER_EDITADO')
  }
}
