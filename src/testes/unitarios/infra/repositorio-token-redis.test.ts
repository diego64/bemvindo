import { describe, it, expect, vi } from 'vitest'
import { RepositorioTokenRedis } from '@/modulos/autenticacao/infra/repositorios/repositorio-token-redis'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'
import type { DadosToken } from '@/modulos/autenticacao/dominio/repositorios/repositorio-token'
import type { Redis } from 'ioredis'

function criarRedisMock(valorGet: string | null = null) {
  const setFn = vi.fn().mockResolvedValue('OK')
  const getFn = vi.fn().mockResolvedValue(valorGet)
  const delFn = vi.fn().mockResolvedValue(1)
  const redis = { set: setFn, get: getFn, del: delFn } as unknown as Redis
  return { redis, setFn, getFn, delFn }
}

const dadosTokenValidos: DadosToken = {
  usuarioId: 'usuario-id-teste',
  email: 'usuario@teste.com',
  papel: PapelUsuario.RECEPCIONISTA,
  iat: Math.floor(Date.now() / 1000),
}

describe('RepositorioTokenRedis', () => {
  describe('armazenar()', () => {
    it('deve chamar redis.set com a chave correta e TTL de 7 dias', async () => {
      const { redis, setFn } = criarRedisMock()
      const repositorio = new RepositorioTokenRedis(redis)

      await repositorio.armazenar('usuario-123', 'hash-abc', dadosTokenValidos)

      expect(setFn).toHaveBeenCalledWith(
        'refresh_token:usuario-123:hash-abc',
        JSON.stringify(dadosTokenValidos),
        'EX',
        7 * 24 * 60 * 60,
      )
    })
  })

  describe('buscar()', () => {
    it('deve retornar null quando chave não existe no Redis', async () => {
      const { redis } = criarRedisMock(null)
      const repositorio = new RepositorioTokenRedis(redis)

      const resultado = await repositorio.buscar('usuario-123', 'hash-abc')

      expect(resultado).toBeNull()
    })

    it('deve retornar DadosToken para JSON válido e papel correto', async () => {
      const { redis } = criarRedisMock(JSON.stringify(dadosTokenValidos))
      const repositorio = new RepositorioTokenRedis(redis)

      const resultado = await repositorio.buscar('usuario-123', 'hash-abc')

      expect(resultado).toEqual(dadosTokenValidos)
    })

    it('deve retornar null para JSON com papel inválido — branch papel não incluído em PapelUsuario', async () => {
      const dadosComPapelInvalido = {
        usuarioId: 'usuario-id-teste',
        email: 'usuario@teste.com',
        papel: 'PAPEL_INVALIDO',
        iat: Math.floor(Date.now() / 1000),
      }
      const { redis } = criarRedisMock(JSON.stringify(dadosComPapelInvalido))
      const repositorio = new RepositorioTokenRedis(redis)

      const resultado = await repositorio.buscar('usuario-123', 'hash-abc')

      expect(resultado).toBeNull()
    })

    it('deve retornar null para JSON com campo obrigatório ausente', () => {
      const dadosSemEmail = {
        usuarioId: 'usuario-id-teste',
        papel: PapelUsuario.RECEPCIONISTA,
        iat: Math.floor(Date.now() / 1000),
      }
      const { redis } = criarRedisMock(JSON.stringify(dadosSemEmail))
      const repositorio = new RepositorioTokenRedis(redis)

      return repositorio.buscar('usuario-123', 'hash-abc').then((resultado) => {
        expect(resultado).toBeNull()
      })
    })

    it('deve retornar null para JSON com usuarioId ausente', async () => {
      const dadosSemUsuarioId = {
        email: 'usuario@teste.com',
        papel: PapelUsuario.RECEPCIONISTA,
        iat: Math.floor(Date.now() / 1000),
      }
      const { redis } = criarRedisMock(JSON.stringify(dadosSemUsuarioId))
      const repositorio = new RepositorioTokenRedis(redis)

      const resultado = await repositorio.buscar('usuario-123', 'hash-abc')

      expect(resultado).toBeNull()
    })

    it('deve retornar null para JSON com iat ausente', async () => {
      const dadosSemIat = {
        usuarioId: 'usuario-id-teste',
        email: 'usuario@teste.com',
        papel: PapelUsuario.RECEPCIONISTA,
      }
      const { redis } = criarRedisMock(JSON.stringify(dadosSemIat))
      const repositorio = new RepositorioTokenRedis(redis)

      const resultado = await repositorio.buscar('usuario-123', 'hash-abc')

      expect(resultado).toBeNull()
    })

    it('deve retornar null para JSON com valor não sendo objeto — branch catch', async () => {
      const { redis } = criarRedisMock('nao-e-json-valido{{{')
      const repositorio = new RepositorioTokenRedis(redis)

      const resultado = await repositorio.buscar('usuario-123', 'hash-abc')

      expect(resultado).toBeNull()
    })

    it('deve retornar null para valor primitivo (string JSON)', async () => {
      const { redis } = criarRedisMock('"apenas-string"')
      const repositorio = new RepositorioTokenRedis(redis)

      const resultado = await repositorio.buscar('usuario-123', 'hash-abc')

      expect(resultado).toBeNull()
    })

    it('deve retornar null para valor null no JSON', async () => {
      const { redis } = criarRedisMock('null')
      const repositorio = new RepositorioTokenRedis(redis)

      const resultado = await repositorio.buscar('usuario-123', 'hash-abc')

      expect(resultado).toBeNull()
    })

    it('deve retornar DadosToken com papel ADMINISTRADOR', async () => {
      const dadosAdmin: DadosToken = {
        usuarioId: 'admin-id',
        email: 'admin@teste.com',
        papel: PapelUsuario.ADMINISTRADOR,
        iat: Math.floor(Date.now() / 1000),
      }
      const { redis } = criarRedisMock(JSON.stringify(dadosAdmin))
      const repositorio = new RepositorioTokenRedis(redis)

      const resultado = await repositorio.buscar('admin-id', 'hash-xyz')

      expect(resultado?.papel).toBe(PapelUsuario.ADMINISTRADOR)
    })
  })

  describe('revogar()', () => {
    it('deve chamar redis.del com a chave correta', async () => {
      const { redis, delFn } = criarRedisMock()
      const repositorio = new RepositorioTokenRedis(redis)

      await repositorio.revogar('usuario-123', 'hash-abc')

      expect(delFn).toHaveBeenCalledWith('refresh_token:usuario-123:hash-abc')
    })
  })
})
