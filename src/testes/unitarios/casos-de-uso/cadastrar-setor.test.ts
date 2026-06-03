import { describe, it, expect, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { CadastrarSetor } from '@/modulos/setores/aplicacao/casos-de-uso/cadastrar-setor'
import { ErroNomeSetorJaCadastrado } from '@/compartilhado/erros/erro-nome-setor-ja-cadastrado'
import { ErroNomeSetorInvalido } from '@/compartilhado/erros/erro-nome-setor-invalido'
import type { RepositorioSetor } from '@/modulos/setores/dominio/repositorios/repositorio-setor'
import { Setor } from '@/modulos/setores/dominio/entidades/setor'

function setorMock(nome: string): Setor {
  const id = new ObjectId()
  return new Setor({
    id,
    nome,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    criadoPor: id,
    atualizadoPor: id,
  })
}

function criarRepositorioMock(existente: Setor | null = null): RepositorioSetor {
  return {
    criar: vi.fn().mockResolvedValue(undefined),
    buscarPorId: vi.fn().mockResolvedValue(null),
    buscarPorNome: vi.fn().mockResolvedValue(existente),
    listar: vi.fn().mockResolvedValue([]),
  }
}

const entradaValida = {
  nome: 'Recursos Humanos',
  requisitanteId: new ObjectId().toString(),
}

describe('CadastrarSetor', () => {
  it('deve cadastrar setor com sucesso e retornar DTO', async () => {
    const criarFn = vi.fn().mockResolvedValue(undefined)
    const repositorio: RepositorioSetor = {
      criar: criarFn,
      buscarPorId: vi.fn().mockResolvedValue(null),
      buscarPorNome: vi.fn().mockResolvedValue(null),
      listar: vi.fn().mockResolvedValue([]),
    }
    const casoDeUso = new CadastrarSetor(repositorio)

    const resultado = await casoDeUso.executar(entradaValida)

    expect(resultado.nome).toBe('Recursos Humanos')
    expect(resultado.id).toBeTruthy()
    expect(resultado.criadoEm).toBeTruthy()
    expect(criarFn).toHaveBeenCalledOnce()
  })

  it('deve lançar ErroNomeSetorJaCadastrado quando nome já existe', async () => {
    const repositorio = criarRepositorioMock(setorMock('Recursos Humanos'))
    const casoDeUso = new CadastrarSetor(repositorio)

    await expect(casoDeUso.executar(entradaValida)).rejects.toThrow(ErroNomeSetorJaCadastrado)
  })

  it('deve lançar ErroNomeSetorInvalido quando nome tem menos de 2 caracteres', async () => {
    const repositorio = criarRepositorioMock()
    const casoDeUso = new CadastrarSetor(repositorio)

    await expect(casoDeUso.executar({ ...entradaValida, nome: 'A' })).rejects.toThrow(
      ErroNomeSetorInvalido,
    )
  })

  it('deve normalizar o nome removendo espaços antes de verificar unicidade', async () => {
    const buscarPorNomeFn = vi.fn().mockResolvedValue(null)
    const repositorio: RepositorioSetor = {
      criar: vi.fn().mockResolvedValue(undefined),
      buscarPorId: vi.fn().mockResolvedValue(null),
      buscarPorNome: buscarPorNomeFn,
      listar: vi.fn().mockResolvedValue([]),
    }
    const casoDeUso = new CadastrarSetor(repositorio)

    const resultado = await casoDeUso.executar({ ...entradaValida, nome: '  TI  ' })

    expect(resultado.nome).toBe('TI')
    expect(buscarPorNomeFn).toHaveBeenCalledWith('TI')
  })
})
