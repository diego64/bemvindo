import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroNomeSetorInvalido extends ErroBase {
  constructor() {
    super('Nome do setor deve ter no mínimo 2 caracteres.', 400, 'NOME_SETOR_INVALIDO')
  }
}
