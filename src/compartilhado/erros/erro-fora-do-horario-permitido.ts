import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroForaDoHorarioPermitido extends ErroBase {
  constructor() {
    super('Cadastro permitido apenas entre 08:00 e 16:59 (horário de Brasília).', 403, 'FORA_DO_HORARIO_PERMITIDO')
  }
}
