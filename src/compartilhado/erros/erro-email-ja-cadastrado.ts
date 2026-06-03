import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroEmailJaCadastrado extends ErroBase {
  constructor() {
    super('Email já cadastrado.', 409, 'EMAIL_JA_CADASTRADO')
  }
}
