import { ErroBase } from '@/compartilhado/erros/erro-base'

export class ErroValidacao extends ErroBase {
  constructor(mensagem: string, codigo: string) {
    super(mensagem, 400, codigo)
  }
}
