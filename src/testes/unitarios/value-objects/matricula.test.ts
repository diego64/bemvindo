import { describe, it, expect } from 'vitest'
import { Matricula } from '@/modulos/usuarios/dominio/value-objects/matricula'
import { ErroMatriculaInvalida } from '@/compartilhado/erros/erro-matricula-invalida'

describe('Matricula', () => {
  describe('construtor', () => {
    it('deve aceitar matrícula no formato correto', () => {
      const matricula = new Matricula('RECEP0000001')
      expect(matricula.valor).toBe('RECEP0000001')
    })

    it('deve aceitar matrícula com todos os dígitos em 9', () => {
      const matricula = new Matricula('RECEP9999999')
      expect(matricula.valor).toBe('RECEP9999999')
    })

    it('deve lançar ErroMatriculaInvalida para prefixo errado', () => {
      expect(() => new Matricula('RECEP000001')).toThrow(ErroMatriculaInvalida)
    })

    it('deve lançar ErroMatriculaInvalida para poucos dígitos', () => {
      expect(() => new Matricula('RECEP000001')).toThrow(ErroMatriculaInvalida)
    })

    it('deve lançar ErroMatriculaInvalida para muitos dígitos', () => {
      expect(() => new Matricula('RECEP00000001')).toThrow(ErroMatriculaInvalida)
    })

    it('deve lançar ErroMatriculaInvalida para prefixo minúsculo', () => {
      expect(() => new Matricula('recep0000001')).toThrow(ErroMatriculaInvalida)
    })

    it('deve lançar ErroMatriculaInvalida para string vazia', () => {
      expect(() => new Matricula('')).toThrow(ErroMatriculaInvalida)
    })
  })

  describe('formatar()', () => {
    it('deve formatar número 1 como RECEP0000001', () => {
      expect(Matricula.formatar(1)).toBe('RECEP0000001')
    })

    it('deve formatar número 42 como RECEP0000042', () => {
      expect(Matricula.formatar(42)).toBe('RECEP0000042')
    })

    it('deve formatar número 9999999 como RECEP9999999', () => {
      expect(Matricula.formatar(9_999_999)).toBe('RECEP9999999')
    })

    it('deve gerar string aceita pelo construtor', () => {
      const formatado = Matricula.formatar(100)
      expect(() => new Matricula(formatado)).not.toThrow()
    })
  })

  describe('validar()', () => {
    it('deve retornar true para matrícula válida', () => {
      expect(Matricula.validar('RECEP0000001')).toBe(true)
    })

    it('deve retornar false para matrícula inválida', () => {
      expect(Matricula.validar('INVALID')).toBe(false)
    })
  })

  describe('igual()', () => {
    it('deve retornar true para matrículas iguais', () => {
      expect(new Matricula('RECEP0000001').igual(new Matricula('RECEP0000001'))).toBe(true)
    })

    it('deve retornar false para matrículas diferentes', () => {
      expect(new Matricula('RECEP0000001').igual(new Matricula('RECEP0000002'))).toBe(false)
    })
  })
})
