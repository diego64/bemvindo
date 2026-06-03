import { ErroTelefoneInvalido } from '@/compartilhado/erros/erro-telefone-invalido'

export class Telefone {
  readonly valor: string

  constructor(telefone: string) {
    const normalizado = telefone.replace(/\D/g, '')
    if (!Telefone.validar(normalizado)) throw new ErroTelefoneInvalido()
    this.valor = normalizado
  }

  private static validar(telefone: string): boolean {
    return telefone.length === 10 || telefone.length === 11
  }

  igual(outro: Telefone): boolean {
    return this.valor === outro.valor
  }
}
