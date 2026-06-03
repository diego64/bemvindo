import { ErroMatriculaInvalida } from '@/compartilhado/erros/erro-matricula-invalida'

export class Matricula {
  readonly valor: string

  constructor(matricula: string) {
    if (!Matricula.validar(matricula)) throw new ErroMatriculaInvalida()
    this.valor = matricula
  }

  static validar(matricula: string): boolean {
    return /^RECEP\d{7}$/.test(matricula)
  }

  static formatar(numero: number): string {
    return `RECEP${String(numero).padStart(7, '0')}`
  }

  igual(outro: Matricula): boolean {
    return this.valor === outro.valor
  }
}
