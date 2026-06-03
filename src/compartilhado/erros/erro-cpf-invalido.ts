import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroCpfInvalido extends ErroBase {
  constructor() {
    super('CPF inválido.', 400, 'CPF_INVALIDO')
  }
}
