import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroNomeSetorJaCadastrado extends ErroBase {
  constructor() {
    super('Já existe um setor com este nome.', 409, 'NOME_SETOR_JA_CADASTRADO')
  }
}
