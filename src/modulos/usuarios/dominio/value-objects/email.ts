import { ErroEmailInvalido } from '@/compartilhado/erros/erro-email-invalido'

export class Email {
  readonly valor: string

  constructor(email: string) {
    const normalizado = email.toLowerCase().trim()
    if (!Email.validar(normalizado)) throw new ErroEmailInvalido()
    this.valor = normalizado
  }

  private static validar(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  igual(outro: Email): boolean {
    return this.valor === outro.valor
  }
}
