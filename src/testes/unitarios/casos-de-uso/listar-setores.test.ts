import { describe, it, expect, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { ListarSetores } from '@/modulos/setores/aplicacao/casos-de-uso/listar-setores'
import type { RepositorioSetor } from '@/modulos/setores/dominio/repositorios/repositorio-setor'
import { Setor } from '@/modulos/setores/dominio/entidades/setor'

function criarSetorMock(nome: string): Setor {
  const id = new ObjectId()
  return new Setor({
    id,
    nome,
    criadoEm: new Date('2024-01-01'),
    atualizadoEm: new Date('2024-01-01'),
    criadoPor: id,
    atualizadoPor: id,
  })
}

function criarRepositorioMock(setores: Setor[]): RepositorioSetor {
  return {
    criar: vi.fn(),
    buscarPorId: vi.fn(),
    buscarPorNome: vi.fn(),
    listar: vi.fn().mockResolvedValue(setores),
  }
}

describe('ListarSetores', () => {
  it('deve retornar lista de DTOs com id, nome e criadoEm', async () => {
    const setores = [criarSetorMock('TI'), criarSetorMock('RH')]
    const casoDeUso = new ListarSetores(criarRepositorioMock(setores))

    const resultado = await casoDeUso.executar()

    expect(resultado).toHaveLength(2)
    expect(resultado[0].nome).toBe('TI')
    expect(resultado[1].nome).toBe('RH')
    expect(resultado[0]).toHaveProperty('id')
    expect(resultado[0]).toHaveProperty('criadoEm')
  })

  it('deve retornar id como string (não ObjectId)', async () => {
    const setor = criarSetorMock('TI')
    const casoDeUso = new ListarSetores(criarRepositorioMock([setor]))

    const resultado = await casoDeUso.executar()

    expect(typeof resultado[0].id).toBe('string')
  })

  it('deve retornar criadoEm como ISO string', async () => {
    const setor = criarSetorMock('TI')
    const casoDeUso = new ListarSetores(criarRepositorioMock([setor]))

    const resultado = await casoDeUso.executar()

    expect(typeof resultado[0].criadoEm).toBe('string')
    expect(() => new Date(resultado[0].criadoEm)).not.toThrow()
  })

  it('deve retornar lista vazia quando não há setores', async () => {
    const casoDeUso = new ListarSetores(criarRepositorioMock([]))

    const resultado = await casoDeUso.executar()

    expect(resultado).toHaveLength(0)
  })
})
