export class CodigoVisitante {
  readonly valor: string

  constructor(codigo: string) {
    if (!CodigoVisitante.validar(codigo)) {
      throw new Error('Código de visitante inválido.')
    }
    this.valor = codigo
  }

  static validar(codigo: string): boolean {
    return /^VIST\d{7}$/.test(codigo)
  }

  static formatar(numero: number): string {
    const normalizado = numero > 9_999_999 ? (numero % 9_999_999) || 1 : numero
    return `VIST${String(normalizado).padStart(7, '0')}`
  }

  igual(outro: CodigoVisitante): boolean {
    return this.valor === outro.valor
  }
}
