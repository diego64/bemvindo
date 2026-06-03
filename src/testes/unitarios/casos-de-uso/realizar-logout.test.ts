import { describe, it, expect, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { RealizarLogout } from '@/modulos/autenticacao/aplicacao/casos-de-uso/realizar-logout'
import type { RepositorioToken } from '@/modulos/autenticacao/dominio/repositorios/repositorio-token'

describe('RealizarLogout', () => {
  it('deve revogar o token quando cookie é válido', async () => {
    const revogarFn = vi.fn().mockResolvedValue(undefined)
    const repositorioToken: RepositorioToken = { armazenar: vi.fn(), buscar: vi.fn(), revogar: revogarFn }
    const casoDeUso = new RealizarLogout(repositorioToken)
    const usuarioId = new ObjectId().toString()

    await casoDeUso.executar(`${usuarioId}:rawToken123`)

    expect(revogarFn).toHaveBeenCalledOnce()
    const [idChamado] = revogarFn.mock.calls[0] as [string, string]
    expect(idChamado).toBe(usuarioId)
  })

  it('deve revogar com o hash SHA-256 do rawToken (não o rawToken em claro)', async () => {
    const revogarFn = vi.fn().mockResolvedValue(undefined)
    const repositorioToken: RepositorioToken = { armazenar: vi.fn(), buscar: vi.fn(), revogar: revogarFn }
    const casoDeUso = new RealizarLogout(repositorioToken)

    await casoDeUso.executar(`${new ObjectId().toString()}:rawToken123`)

    const [, hashChamado] = revogarFn.mock.calls[0] as [string, string]
    expect(hashChamado).not.toBe('rawToken123')
    expect(hashChamado).toHaveLength(64)
  })

  it('deve retornar silenciosamente para cookie sem separador ":"', async () => {
    const revogarFn = vi.fn().mockResolvedValue(undefined)
    const repositorioToken: RepositorioToken = { armazenar: vi.fn(), buscar: vi.fn(), revogar: revogarFn }
    const casoDeUso = new RealizarLogout(repositorioToken)

    await expect(casoDeUso.executar('cookiesempontodoispontos')).resolves.not.toThrow()
    expect(revogarFn).not.toHaveBeenCalled()
  })

  it('deve retornar silenciosamente para usuarioId vazio', async () => {
    const revogarFn = vi.fn().mockResolvedValue(undefined)
    const repositorioToken: RepositorioToken = { armazenar: vi.fn(), buscar: vi.fn(), revogar: revogarFn }
    const casoDeUso = new RealizarLogout(repositorioToken)

    await expect(casoDeUso.executar(':rawToken')).resolves.not.toThrow()
    expect(revogarFn).not.toHaveBeenCalled()
  })

  it('deve retornar silenciosamente para rawToken vazio', async () => {
    const revogarFn = vi.fn().mockResolvedValue(undefined)
    const repositorioToken: RepositorioToken = { armazenar: vi.fn(), buscar: vi.fn(), revogar: revogarFn }
    const casoDeUso = new RealizarLogout(repositorioToken)

    await expect(casoDeUso.executar(`${new ObjectId().toString()}:`)).resolves.not.toThrow()
    expect(revogarFn).not.toHaveBeenCalled()
  })

  it('deve retornar silenciosamente para usuarioId que não é ObjectId válido', async () => {
    const revogarFn = vi.fn().mockResolvedValue(undefined)
    const repositorioToken: RepositorioToken = { armazenar: vi.fn(), buscar: vi.fn(), revogar: revogarFn }
    const casoDeUso = new RealizarLogout(repositorioToken)

    await expect(casoDeUso.executar('nao-e-objectid:rawToken')).resolves.not.toThrow()
    expect(revogarFn).not.toHaveBeenCalled()
  })

  it('deve retornar silenciosamente para string vazia', async () => {
    const revogarFn = vi.fn().mockResolvedValue(undefined)
    const repositorioToken: RepositorioToken = { armazenar: vi.fn(), buscar: vi.fn(), revogar: revogarFn }
    const casoDeUso = new RealizarLogout(repositorioToken)

    await expect(casoDeUso.executar('')).resolves.not.toThrow()
    expect(revogarFn).not.toHaveBeenCalled()
  })
})
