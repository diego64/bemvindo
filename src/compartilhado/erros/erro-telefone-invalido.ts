import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroTelefoneInvalido extends ErroBase {
  constructor() {
    super('Telefone inválido. Informe DDD + número (10 ou 11 dígitos).', 400, 'TELEFONE_INVALIDO')
  }
}
