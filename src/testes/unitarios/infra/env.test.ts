import { describe, it, expect } from 'vitest'
import { resolverEnv } from '@/infra/http/env'

const envBase = {
  JWT_SECRETO: 'segredo-de-teste-com-pelo-menos-32-caracteres',
  MONGO_URI: 'mongodb://localhost:27017/bem-vindo',
  REDIS_URL: 'redis://localhost:6379',
}

describe('resolverEnv', () => {
  describe('resolução de porta', () => {
    it('deve usar PORTA quando apenas PORTA está definida', () => {
      const resultado = resolverEnv({ ...envBase, PORTA: '4000' })

      expect(resultado.success).toBe(true)
      if (resultado.success) {
        expect(resultado.data.PORTA).toBe(4000)
      }
    })

    it('deve usar PORT (Render) quando PORT está definida e PORTA não', () => {
      const resultado = resolverEnv({ ...envBase, PORT: '10000' })

      expect(resultado.success).toBe(true)
      if (resultado.success) {
        expect(resultado.data.PORTA).toBe(10000)
      }
    })

    it('deve dar precedência a PORT sobre PORTA quando ambas estão definidas', () => {
      const resultado = resolverEnv({ ...envBase, PORT: '10000', PORTA: '3000' })

      expect(resultado.success).toBe(true)
      if (resultado.success) {
        expect(resultado.data.PORTA).toBe(10000)
      }
    })

    it('deve usar porta padrão 3000 quando nem PORT nem PORTA estão definidas', () => {
      const resultado = resolverEnv({ ...envBase })

      expect(resultado.success).toBe(true)
      if (resultado.success) {
        expect(resultado.data.PORTA).toBe(3000)
      }
    })
  })

  describe('validação de variáveis obrigatórias', () => {
    it('deve falhar quando JWT_SECRETO está ausente', () => {
      const resultado = resolverEnv({ MONGO_URI: envBase.MONGO_URI, REDIS_URL: envBase.REDIS_URL })

      expect(resultado.success).toBe(false)
    })

    it('deve falhar quando JWT_SECRETO tem menos de 32 caracteres', () => {
      const resultado = resolverEnv({ ...envBase, JWT_SECRETO: 'curto' })

      expect(resultado.success).toBe(false)
    })

    it('deve falhar quando MONGO_URI está ausente', () => {
      const resultado = resolverEnv({ JWT_SECRETO: envBase.JWT_SECRETO, REDIS_URL: envBase.REDIS_URL })

      expect(resultado.success).toBe(false)
    })

    it('deve falhar quando REDIS_URL está ausente', () => {
      const resultado = resolverEnv({ JWT_SECRETO: envBase.JWT_SECRETO, MONGO_URI: envBase.MONGO_URI })

      expect(resultado.success).toBe(false)
    })

    it('deve usar NODE_ENV padrão development quando não definido', () => {
      const resultado = resolverEnv({ ...envBase })

      expect(resultado.success).toBe(true)
      if (resultado.success) {
        expect(resultado.data.NODE_ENV).toBe('development')
      }
    })

    it('deve aceitar NODE_ENV production', () => {
      const resultado = resolverEnv({ ...envBase, NODE_ENV: 'production' })

      expect(resultado.success).toBe(true)
      if (resultado.success) {
        expect(resultado.data.NODE_ENV).toBe('production')
      }
    })
  })
})
