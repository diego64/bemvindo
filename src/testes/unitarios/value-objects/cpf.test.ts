import { describe, it, expect } from 'vitest'
import { Cpf } from '@/modulos/visitantes/dominio/value-objects/cpf'
import { ErroCpfInvalido } from '@/compartilhado/erros/erro-cpf-invalido'

describe('Cpf', () => {
  describe('construtor — CPFs válidos', () => {
    it('deve aceitar CPF com máscara', () => {
      const cpf = new Cpf('529.982.247-25')
      expect(cpf.valor).toBe('52998224725')
    })

    it('deve aceitar CPF sem máscara', () => {
      const cpf = new Cpf('52998224725')
      expect(cpf.valor).toBe('52998224725')
    })

    it('deve normalizar removendo todos os caracteres não-dígitos', () => {
      const cpf = new Cpf('529 982 247 25')
      expect(cpf.valor).toBe('52998224725')
    })

    it('deve aceitar outro CPF válido', () => {
      const cpf = new Cpf('111.444.777-35')
      expect(cpf.valor).toBe('11144477735')
    })
  })

  describe('construtor — CPFs inválidos', () => {
    it('deve lançar ErroCpfInvalido para todos os dígitos iguais (111.111.111-11)', () => {
      expect(() => new Cpf('111.111.111-11')).toThrow(ErroCpfInvalido)
    })

    it('deve lançar ErroCpfInvalido para todos os dígitos iguais (000.000.000-00)', () => {
      expect(() => new Cpf('000.000.000-00')).toThrow(ErroCpfInvalido)
    })

    it('deve lançar ErroCpfInvalido para todos os dígitos iguais (999.999.999-99)', () => {
      expect(() => new Cpf('999.999.999-99')).toThrow(ErroCpfInvalido)
    })

    it('deve lançar ErroCpfInvalido para dígito verificador errado', () => {
      expect(() => new Cpf('529.982.247-26')).toThrow(ErroCpfInvalido)
    })

    it('deve lançar ErroCpfInvalido para CPF com 10 dígitos', () => {
      expect(() => new Cpf('1234567890')).toThrow(ErroCpfInvalido)
    })

    it('deve lançar ErroCpfInvalido para CPF com 12 dígitos', () => {
      expect(() => new Cpf('123456789012')).toThrow(ErroCpfInvalido)
    })

    it('deve lançar ErroCpfInvalido para string vazia', () => {
      expect(() => new Cpf('')).toThrow(ErroCpfInvalido)
    })

    it('deve lançar ErroCpfInvalido para segundo dígito verificador errado', () => {
      expect(() => new Cpf('529.982.247-24')).toThrow(ErroCpfInvalido)
    })
  })

  describe('igual()', () => {
    it('deve retornar true para CPFs com o mesmo valor', () => {
      const a = new Cpf('529.982.247-25')
      const b = new Cpf('52998224725')
      expect(a.igual(b)).toBe(true)
    })

    it('deve retornar false para CPFs diferentes', () => {
      const a = new Cpf('529.982.247-25')
      const b = new Cpf('111.444.777-35')
      expect(a.igual(b)).toBe(false)
    })
  })
})
