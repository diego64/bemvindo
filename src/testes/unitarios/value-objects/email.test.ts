import { describe, it, expect } from 'vitest'
import { Email } from '@/modulos/usuarios/dominio/value-objects/email'
import { ErroEmailInvalido } from '@/compartilhado/erros/erro-email-invalido'

describe('Email', () => {
  describe('construtor — emails válidos', () => {
    it('deve aceitar email válido', () => {
      const email = new Email('usuario@empresa.com')
      expect(email.valor).toBe('usuario@empresa.com')
    })

    it('deve normalizar para lowercase', () => {
      const email = new Email('USUARIO@EMPRESA.COM')
      expect(email.valor).toBe('usuario@empresa.com')
    })

    it('deve remover espaços ao redor (trim)', () => {
      const email = new Email('  usuario@empresa.com  ')
      expect(email.valor).toBe('usuario@empresa.com')
    })

    it('deve aceitar email com subdomínio', () => {
      const email = new Email('usuario@mail.empresa.com.br')
      expect(email.valor).toBe('usuario@mail.empresa.com.br')
    })

    it('deve normalizar maiúsculas e remover espaços combinados', () => {
      const email = new Email('  Admin@EMPRESA.Com  ')
      expect(email.valor).toBe('admin@empresa.com')
    })
  })

  describe('construtor — emails inválidos', () => {
    it('deve lançar ErroEmailInvalido para email sem @', () => {
      expect(() => new Email('usuarioempresa.com')).toThrow(ErroEmailInvalido)
    })

    it('deve lançar ErroEmailInvalido para email sem domínio', () => {
      expect(() => new Email('usuario@')).toThrow(ErroEmailInvalido)
    })

    it('deve lançar ErroEmailInvalido para email sem parte local', () => {
      expect(() => new Email('@empresa.com')).toThrow(ErroEmailInvalido)
    })

    it('deve lançar ErroEmailInvalido para string vazia', () => {
      expect(() => new Email('')).toThrow(ErroEmailInvalido)
    })

    it('deve lançar ErroEmailInvalido para email com espaço interno', () => {
      expect(() => new Email('user name@empresa.com')).toThrow(ErroEmailInvalido)
    })
  })

  describe('igual()', () => {
    it('deve retornar true para emails com mesmo valor normalizado', () => {
      const a = new Email('usuario@empresa.com')
      const b = new Email('USUARIO@EMPRESA.COM')
      expect(a.igual(b)).toBe(true)
    })

    it('deve retornar false para emails diferentes', () => {
      const a = new Email('a@empresa.com')
      const b = new Email('b@empresa.com')
      expect(a.igual(b)).toBe(false)
    })
  })
})
