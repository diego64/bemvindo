import { describe, it, expect } from 'vitest'
import { CodigoVisitante } from '@/modulos/visitantes/dominio/value-objects/codigo-visitante'

describe('CodigoVisitante', () => {
  describe('construtor', () => {
    it('deve aceitar código no formato correto', () => {
      const codigo = new CodigoVisitante('VIST0000001')
      expect(codigo.valor).toBe('VIST0000001')
    })

    it('deve aceitar código com número máximo', () => {
      const codigo = new CodigoVisitante('VIST9999999')
      expect(codigo.valor).toBe('VIST9999999')
    })

    it('deve lançar erro para código sem prefixo VIST', () => {
      expect(() => new CodigoVisitante('VISIT000001')).toThrow()
    })

    it('deve lançar erro para código com menos de 7 dígitos', () => {
      expect(() => new CodigoVisitante('VIST000001')).toThrow()
    })

    it('deve lançar erro para código com letras nos dígitos', () => {
      expect(() => new CodigoVisitante('VIST000001A')).toThrow()
    })

    it('deve lançar erro para string vazia', () => {
      expect(() => new CodigoVisitante('')).toThrow()
    })
  })

  describe('formatar()', () => {
    it('deve formatar número 1 como VIST0000001', () => {
      expect(CodigoVisitante.formatar(1)).toBe('VIST0000001')
    })

    it('deve formatar número 42 como VIST0000042', () => {
      expect(CodigoVisitante.formatar(42)).toBe('VIST0000042')
    })

    it('deve formatar número máximo 9999999 como VIST9999999', () => {
      expect(CodigoVisitante.formatar(9_999_999)).toBe('VIST9999999')
    })

    it('deve reiniciar em VIST0000001 quando número excede 9999999', () => {
      expect(CodigoVisitante.formatar(10_000_000)).toBe('VIST0000001')
    })

    it('deve reiniciar corretamente para múltiplos de 9999999', () => {
      const resultado = CodigoVisitante.formatar(9_999_999 + 5)
      expect(resultado).toMatch(/^VIST\d{7}$/)
    })

    it('deve reiniciar em VIST0000001 para múltiplo exato de 9999999 — branch || 1', () => {
      // 9_999_999 * 2 = 19_999_998 → 19_999_998 % 9_999_999 === 0 → usa || 1
      expect(CodigoVisitante.formatar(9_999_999 * 2)).toBe('VIST0000001')
    })
  })

  describe('validar()', () => {
    it('deve retornar true para código válido', () => {
      expect(CodigoVisitante.validar('VIST0000001')).toBe(true)
    })

    it('deve retornar false para código inválido', () => {
      expect(CodigoVisitante.validar('INVALID')).toBe(false)
    })
  })

  describe('igual()', () => {
    it('deve retornar true para códigos iguais', () => {
      expect(new CodigoVisitante('VIST0000001').igual(new CodigoVisitante('VIST0000001'))).toBe(true)
    })

    it('deve retornar false para códigos diferentes', () => {
      expect(new CodigoVisitante('VIST0000001').igual(new CodigoVisitante('VIST0000002'))).toBe(false)
    })
  })
})
