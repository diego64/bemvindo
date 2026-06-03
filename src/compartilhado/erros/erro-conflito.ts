import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroConflito extends ErroBase {
  constructor(mensagem: string, codigo: string) {
    super(mensagem, 409, codigo)
  }
}
