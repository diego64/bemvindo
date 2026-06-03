import { describe, it, expect } from 'vitest'
import { Telefone } from '@/modulos/usuarios/dominio/value-objects/telefone'
import { ErroTelefoneInvalido } from '@/compartilhado/erros/erro-telefone-invalido'

describe('Telefone', () => {
  describe('construtor — telefones válidos', () => {
    it('deve aceitar telefone fixo com 10 dígitos', () => {
      const tel = new Telefone('1133334444')
      expect(tel.valor).toBe('1133334444')
    })

    it('deve aceitar celular com 11 dígitos', () => {
      const tel = new Telefone('11999998888')
      expect(tel.valor).toBe('11999998888')
    })

    it('deve remover traços e parênteses', () => {
      const tel = new Telefone('(11) 99999-8888')
      expect(tel.valor).toBe('11999998888')
    })

    it('deve remover espaços internos', () => {
      const tel = new Telefone('11 99999 8888')
      expect(tel.valor).toBe('11999998888')
    })

    it('deve remover parênteses, espaços e traços', () => {
      const tel = new Telefone('(11) 9999-8888')
      expect(tel.valor).toBe('1199998888')
    })
  })

  describe('construtor — telefones inválidos', () => {
    it('deve lançar ErroTelefoneInvalido para 9 dígitos', () => {
      expect(() => new Telefone('119999888')).toThrow(ErroTelefoneInvalido)
    })

    it('deve lançar ErroTelefoneInvalido para 12 dígitos', () => {
      expect(() => new Telefone('119999888800')).toThrow(ErroTelefoneInvalido)
    })

    it('deve lançar ErroTelefoneInvalido para string vazia', () => {
      expect(() => new Telefone('')).toThrow(ErroTelefoneInvalido)
    })

    it('deve lançar ErroTelefoneInvalido para apenas letras', () => {
      expect(() => new Telefone('abcdefghij')).toThrow(ErroTelefoneInvalido)
    })
  })

  describe('igual()', () => {
    it('deve retornar true para telefones com mesmo valor normalizado', () => {
      const a = new Telefone('(11) 99999-8888')
      const b = new Telefone('11999998888')
      expect(a.igual(b)).toBe(true)
    })

    it('deve retornar false para telefones diferentes', () => {
      const a = new Telefone('11999998888')
      const b = new Telefone('11999997777')
      expect(a.igual(b)).toBe(false)
    })
  })
})
