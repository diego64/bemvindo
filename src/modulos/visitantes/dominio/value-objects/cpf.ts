import { ErroCpfInvalido } from '@/compartilhado/erros/erro-cpf-invalido'

export class Cpf {
  readonly valor: string

  constructor(cpf: string) {
    const normalizado = cpf.replace(/\D/g, '')
    if (!Cpf.validar(normalizado)) throw new ErroCpfInvalido()
    this.valor = normalizado
  }

  private static validar(cpf: string): boolean {
    if (cpf.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cpf)) return false

    let soma = 0
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i)
    let resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf[9])) return false

    soma = 0
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i)
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    return resto === parseInt(cpf[10])
  }

  igual(outro: Cpf): boolean {
    return this.valor === outro.valor
  }
}
