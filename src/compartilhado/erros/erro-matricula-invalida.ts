import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroMatriculaInvalida extends ErroBase {
  constructor() {
    super('Matrícula inválida. Formato esperado: RECEP0000000.', 400, 'MATRICULA_INVALIDA')
  }
}
