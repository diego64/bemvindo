import { ErroDiaNaoPermitido } from '@/compartilhado/erros/erro-dia-nao-permitido'
import { ErroForaDoHorarioPermitido } from '@/compartilhado/erros/erro-fora-do-horario-permitido'

export class ServicoDominioVisitante {
  private static obterPartesBRT(data: Date) {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    const mapa: Record<string, string | undefined> = Object.fromEntries(
      fmt.formatToParts(data).map((p) => [p.type, p.value]),
    )
    return {
      ano: parseInt(mapa.year ?? '0', 10),
      mes: parseInt(mapa.month ?? '0', 10),
      dia: parseInt(mapa.day ?? '0', 10),
      hora: parseInt(mapa.hour ?? '0', 10) % 24,
      minuto: parseInt(mapa.minute ?? '0', 10),
    }
  }

  private static calcularPascoa(ano: number): Date {
    const a = ano % 19
    const b = Math.floor(ano / 100)
    const c = ano % 100
    const d = Math.floor(b / 4)
    const e = b % 4
    const f = Math.floor((b + 8) / 25)
    const g = Math.floor((b - f + 1) / 3)
    const h = (19 * a + b - d - g + 15) % 30
    const i = Math.floor(c / 4)
    const k = c % 4
    const l = (32 + 2 * e + 2 * i - h - k) % 7
    const m = Math.floor((a + 11 * h + 22 * l) / 451)
    const mes = Math.floor((h + l - 7 * m + 114) / 31) - 1
    const dia = ((h + l - 7 * m + 114) % 31) + 1
    return new Date(ano, mes, dia)
  }

  private static ehFeriado(dia: number, mes: number, ano: number): boolean {
    const feriadosFixos = [
      { mes: 1, dia: 1 },
      { mes: 4, dia: 21 },
      { mes: 5, dia: 1 },
      { mes: 9, dia: 7 },
      { mes: 10, dia: 12 },
      { mes: 11, dia: 2 },
      { mes: 11, dia: 15 },
      { mes: 11, dia: 20 },
      { mes: 12, dia: 25 },
    ]

    if (feriadosFixos.some((f) => f.mes === mes && f.dia === dia)) return true

    const pascoa = ServicoDominioVisitante.calcularPascoa(ano)
    const sextaSanta = new Date(pascoa)
    sextaSanta.setDate(pascoa.getDate() - 2)
    const corpusChristi = new Date(pascoa)
    corpusChristi.setDate(pascoa.getDate() + 60)

    const feriadosVariaveis = [sextaSanta, corpusChristi]
    return feriadosVariaveis.some(
      (f) => f.getDate() === dia && f.getMonth() + 1 === mes,
    )
  }

  validarHorarioPermitido(agora: Date): void {
    const { hora } = ServicoDominioVisitante.obterPartesBRT(agora)
    if (hora < 8 || hora >= 17) throw new ErroForaDoHorarioPermitido()
  }

  validarDiaPermitido(agora: Date): void {
    const { dia, mes, ano } = ServicoDominioVisitante.obterPartesBRT(agora)
    const diaSemana = new Date(ano, mes - 1, dia).getDay()
    if (diaSemana === 0 || diaSemana === 6) throw new ErroDiaNaoPermitido()
    if (ServicoDominioVisitante.ehFeriado(dia, mes, ano)) throw new ErroDiaNaoPermitido()
  }

  obterIntervaloHoje(agora: Date): { inicioDia: Date; fimDia: Date } {
    const { ano, mes, dia } = ServicoDominioVisitante.obterPartesBRT(agora)
    const anoStr = String(ano)
    const mesStr = String(mes).padStart(2, '0')
    const diaStr = String(dia).padStart(2, '0')
    return {
      inicioDia: new Date(`${anoStr}-${mesStr}-${diaStr}T00:00:00.000-03:00`),
      fimDia: new Date(`${anoStr}-${mesStr}-${diaStr}T23:59:59.999-03:00`),
    }
  }
}
