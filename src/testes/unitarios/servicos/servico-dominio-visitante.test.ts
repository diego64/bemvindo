import { describe, it, expect, vi, afterEach } from 'vitest'
import { ServicoDominioVisitante } from '@/modulos/visitantes/dominio/servicos/servico-dominio-visitante'
import { ErroForaDoHorarioPermitido } from '@/compartilhado/erros/erro-fora-do-horario-permitido'
import { ErroDiaNaoPermitido } from '@/compartilhado/erros/erro-dia-nao-permitido'

// Helpers para criar datas em horário de Brasília (BRT = UTC-3)
function dataBRT(ano: number, mes: number, dia: number, hora: number, minuto = 0): Date {
  const mesStr = String(mes).padStart(2, '0')
  const diaStr = String(dia).padStart(2, '0')
  const horaStr = String(hora).padStart(2, '0')
  const minStr = String(minuto).padStart(2, '0')
  return new Date(`${String(ano)}-${mesStr}-${diaStr}T${horaStr}:${minStr}:00.000-03:00`)
}

afterEach(() => {
  vi.useRealTimers()
})

describe('ServicoDominioVisitante', () => {
  const servico = new ServicoDominioVisitante()

  describe('validarHorarioPermitido()', () => {
    it('deve permitir cadastro no início do horário permitido (08:00 BRT)', () => {
      // 2024-03-06 quarta-feira 08:00 BRT
      const data = dataBRT(2024, 3, 6, 8, 0)

      expect(() => { servico.validarHorarioPermitido(data); }).not.toThrow()
    })

    it('deve permitir cadastro no fim do horário permitido (16:59 BRT)', () => {
      // 2024-03-06 quarta-feira 16:59 BRT
      const data = dataBRT(2024, 3, 6, 16, 59)

      expect(() => { servico.validarHorarioPermitido(data); }).not.toThrow()
    })

    it('deve permitir cadastro ao meio do horário permitido (12:30 BRT)', () => {
      const data = dataBRT(2024, 3, 6, 12, 30)

      expect(() => { servico.validarHorarioPermitido(data); }).not.toThrow()
    })

    it('deve lançar ErroForaDoHorarioPermitido para hora anterior ao permitido (07:59 BRT)', () => {
      const data = dataBRT(2024, 3, 6, 7, 59)

      expect(() => { servico.validarHorarioPermitido(data); }).toThrow(ErroForaDoHorarioPermitido)
    })

    it('deve lançar ErroForaDoHorarioPermitido para hora posterior ao permitido (17:00 BRT)', () => {
      const data = dataBRT(2024, 3, 6, 17, 0)

      expect(() => { servico.validarHorarioPermitido(data); }).toThrow(ErroForaDoHorarioPermitido)
    })

    it('deve lançar ErroForaDoHorarioPermitido para meia-noite (00:00 BRT)', () => {
      const data = dataBRT(2024, 3, 6, 0, 0)

      expect(() => { servico.validarHorarioPermitido(data); }).toThrow(ErroForaDoHorarioPermitido)
    })

    it('deve lançar ErroForaDoHorarioPermitido para 23:59 BRT', () => {
      const data = dataBRT(2024, 3, 6, 23, 59)

      expect(() => { servico.validarHorarioPermitido(data); }).toThrow(ErroForaDoHorarioPermitido)
    })
  })

  describe('validarDiaPermitido() — fins de semana', () => {
    it('deve lançar ErroDiaNaoPermitido para domingo', () => {
      // 2024-03-03 é domingo
      const data = dataBRT(2024, 3, 3, 10, 0)

      expect(() => { servico.validarDiaPermitido(data); }).toThrow(ErroDiaNaoPermitido)
    })

    it('deve lançar ErroDiaNaoPermitido para sábado', () => {
      // 2024-03-02 é sábado
      const data = dataBRT(2024, 3, 2, 10, 0)

      expect(() => { servico.validarDiaPermitido(data); }).toThrow(ErroDiaNaoPermitido)
    })

    it('deve permitir cadastro em dia útil (segunda-feira)', () => {
      // 2024-03-04 é segunda-feira
      const data = dataBRT(2024, 3, 4, 10, 0)

      expect(() => { servico.validarDiaPermitido(data); }).not.toThrow()
    })

    it('deve permitir cadastro em dia útil (sexta-feira não feriado)', () => {
      // 2024-03-08 é sexta-feira
      const data = dataBRT(2024, 3, 8, 10, 0)

      expect(() => { servico.validarDiaPermitido(data); }).not.toThrow()
    })
  })

  describe('validarDiaPermitido() — feriados fixos', () => {
    it('deve lançar ErroDiaNaoPermitido para Confraternização Universal (01/01)', () => {
      // 2024-01-01 é segunda-feira mas é feriado
      const data = dataBRT(2024, 1, 1, 10, 0)

      expect(() => { servico.validarDiaPermitido(data); }).toThrow(ErroDiaNaoPermitido)
    })

    it('deve lançar ErroDiaNaoPermitido para Tiradentes (21/04)', () => {
      // 2024-04-21 é domingo (dia bloqueado também por ser domingo)
      // Usar 2025-04-21 que é segunda-feira
      const data = dataBRT(2025, 4, 21, 10, 0)

      expect(() => { servico.validarDiaPermitido(data); }).toThrow(ErroDiaNaoPermitido)
    })

    it('deve lançar ErroDiaNaoPermitido para Dia do Trabalho (01/05)', () => {
      // 2024-05-01 é quarta-feira
      const data = dataBRT(2024, 5, 1, 10, 0)

      expect(() => { servico.validarDiaPermitido(data); }).toThrow(ErroDiaNaoPermitido)
    })

    it('deve lançar ErroDiaNaoPermitido para Independência (07/09)', () => {
      // 2024-09-07 é sábado — dia bloqueado por fim de semana E feriado
      // Usar 2026-09-07 que é segunda-feira
      const data = dataBRT(2026, 9, 7, 10, 0)

      expect(() => { servico.validarDiaPermitido(data); }).toThrow(ErroDiaNaoPermitido)
    })

    it('deve lançar ErroDiaNaoPermitido para Nossa Sra Aparecida (12/10)', () => {
      // 2026-10-12 é segunda-feira
      const data = dataBRT(2026, 10, 12, 10, 0)

      expect(() => { servico.validarDiaPermitido(data); }).toThrow(ErroDiaNaoPermitido)
    })

    it('deve lançar ErroDiaNaoPermitido para Finados (02/11)', () => {
      // 2026-11-02 é segunda-feira
      const data = dataBRT(2026, 11, 2, 10, 0)

      expect(() => { servico.validarDiaPermitido(data); }).toThrow(ErroDiaNaoPermitido)
    })

    it('deve lançar ErroDiaNaoPermitido para Proclamação da República (15/11)', () => {
      // 2024-11-15 é sexta-feira
      const data = dataBRT(2024, 11, 15, 10, 0)

      expect(() => { servico.validarDiaPermitido(data); }).toThrow(ErroDiaNaoPermitido)
    })

    it('deve lançar ErroDiaNaoPermitido para Consciência Negra (20/11)', () => {
      // 2024-11-20 é quarta-feira
      const data = dataBRT(2024, 11, 20, 10, 0)

      expect(() => { servico.validarDiaPermitido(data); }).toThrow(ErroDiaNaoPermitido)
    })

    it('deve lançar ErroDiaNaoPermitido para Natal (25/12)', () => {
      // 2024-12-25 é quarta-feira
      const data = dataBRT(2024, 12, 25, 10, 0)

      expect(() => { servico.validarDiaPermitido(data); }).toThrow(ErroDiaNaoPermitido)
    })
  })

  describe('validarDiaPermitido() — feriados variáveis', () => {
    it('deve lançar ErroDiaNaoPermitido para Sexta-feira Santa de 2024', () => {
      // Páscoa 2024 = 31/03. Sexta Santa = 29/03/2024 (sexta-feira)
      const data = dataBRT(2024, 3, 29, 10, 0)

      expect(() => { servico.validarDiaPermitido(data); }).toThrow(ErroDiaNaoPermitido)
    })

    it('deve lançar ErroDiaNaoPermitido para Corpus Christi de 2024', () => {
      // Páscoa 2024 = 31/03. Corpus Christi = 31/03 + 60 dias = 30/05/2024 (quinta-feira)
      const data = dataBRT(2024, 5, 30, 10, 0)

      expect(() => { servico.validarDiaPermitido(data); }).toThrow(ErroDiaNaoPermitido)
    })

    it('deve lançar ErroDiaNaoPermitido para Sexta-feira Santa de 2025', () => {
      // Páscoa 2025 = 20/04. Sexta Santa = 18/04/2025 (sexta-feira)
      const data = dataBRT(2025, 4, 18, 10, 0)

      expect(() => { servico.validarDiaPermitido(data); }).toThrow(ErroDiaNaoPermitido)
    })

    it('deve lançar ErroDiaNaoPermitido para Corpus Christi de 2025', () => {
      // Páscoa 2025 = 20/04. Corpus Christi = 20/04 + 60 dias = 19/06/2025 (quinta-feira)
      const data = dataBRT(2025, 6, 19, 10, 0)

      expect(() => { servico.validarDiaPermitido(data); }).toThrow(ErroDiaNaoPermitido)
    })

    it('deve permitir o dia seguinte à Sexta-feira Santa', () => {
      // 30/03/2024 sábado → bloqueado por ser fim de semana; usar segunda 01/04/2024
      const data = dataBRT(2024, 4, 1, 10, 0)

      // Segunda após Páscoa não é feriado nacional
      expect(() => { servico.validarDiaPermitido(data); }).not.toThrow()
    })
  })

  describe('obterIntervaloHoje()', () => {
    it('deve retornar início e fim do dia calendário BRT', () => {
      const data = dataBRT(2024, 3, 6, 10, 0)

      const { inicioDia, fimDia } = servico.obterIntervaloHoje(data)

      // Início deve ser 2024-03-06T00:00:00 BRT = 2024-03-06T03:00:00 UTC
      expect(inicioDia.toISOString()).toBe('2024-03-06T03:00:00.000Z')
      // Fim deve ser 2024-03-06T23:59:59.999 BRT = 2024-03-07T02:59:59.999 UTC
      expect(fimDia.toISOString()).toBe('2024-03-07T02:59:59.999Z')
    })

    it('deve retornar o dia correto para data perto da meia-noite BRT', () => {
      // 2024-03-06 23:30 BRT
      const data = dataBRT(2024, 3, 6, 23, 30)

      const { inicioDia, fimDia } = servico.obterIntervaloHoje(data)

      expect(inicioDia.toISOString()).toBe('2024-03-06T03:00:00.000Z')
      expect(fimDia.toISOString()).toBe('2024-03-07T02:59:59.999Z')
    })

    it('deve retornar o dia correto quando é meia-noite UTC mas ainda dia anterior em BRT', () => {
      // 2024-03-06T00:00:00 UTC = 2024-03-05T21:00 BRT → ainda dia 5
      const dataUTC = new Date('2024-03-06T00:00:00.000Z')

      const { inicioDia, fimDia } = servico.obterIntervaloHoje(dataUTC)

      // Dia 5 em BRT
      expect(inicioDia.toISOString()).toBe('2024-03-05T03:00:00.000Z')
      expect(fimDia.toISOString()).toBe('2024-03-06T02:59:59.999Z')
    })

    it('deve retornar intervalo com inicioDia antes de fimDia', () => {
      const data = dataBRT(2024, 6, 15, 14, 0)

      const { inicioDia, fimDia } = servico.obterIntervaloHoje(data)

      expect(inicioDia.getTime()).toBeLessThan(fimDia.getTime())
    })
  })
})
