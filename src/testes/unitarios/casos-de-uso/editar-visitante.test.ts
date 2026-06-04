import { describe, it, expect, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { EditarVisitante } from '@/modulos/visitantes/aplicacao/casos-de-uso/editar-visitante'
import { ErroVisitanteNaoEncontrado } from '@/compartilhado/erros/erro-visitante-nao-encontrado'
import { ErroVisitanteNaoPodeSerEditado } from '@/compartilhado/erros/erro-visitante-nao-pode-ser-editado'
import type { RepositorioVisitante } from '@/modulos/visitantes/dominio/repositorios/repositorio-visitante'
import { Visitante } from '@/modulos/visitantes/dominio/entidades/visitante'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'

function criarVisitanteMock(criadoEm = new Date()): Visitante {
  const id = new ObjectId()
  const recepId = new ObjectId()
  return new Visitante({
    id,
    codigoVisitante: 'VIST0000001',
    cpf: '52998224725',
    nomeCompleto: 'João Silva',
    dataNascimento: new Date('1990-01-01'),
    telefone: '11999998888',
    email: 'joao@email.com',
    setorDestinoId: new ObjectId(),
    recepcionistaId: recepId,
    recepcionistaNome: 'Recep Teste',
    recepcionistaMatricula: 'RECEP0000001',
    criadoEm,
    atualizadoEm: criadoEm,
    criadoPor: recepId,
    atualizadoPor: recepId,
  })
}

function criarRepositorioMock(visitante: Visitante | null): RepositorioVisitante {
  return {
    criar: vi.fn(),
    buscarPorId: vi.fn().mockResolvedValue(visitante),
    buscarPorCpfEData: vi.fn(),
    atualizar: vi.fn().mockResolvedValue(undefined),
    listarHoje: vi.fn(),
    buscarHistorico: vi.fn(),
  }
}

const requisitanteId = new ObjectId()

describe('EditarVisitante', () => {
  it('deve editar visitante com sucesso e retornar DTO (admin sem restrição de tempo)', async () => {
    const criadoHaMuito = new Date(Date.now() - 60 * 60 * 1000)
    const visitante = criarVisitanteMock(criadoHaMuito)
    const atualizarFn = vi.fn().mockResolvedValue(undefined)
    const repositorio: RepositorioVisitante = {
      criar: vi.fn(), buscarPorId: vi.fn().mockResolvedValue(visitante), buscarPorCpfEData: vi.fn(),
      atualizar: atualizarFn, listarHoje: vi.fn(), buscarHistorico: vi.fn(),
    }
    const casoDeUso = new EditarVisitante(repositorio)

    const resultado = await casoDeUso.executar({
      id: visitante.id.toString(),
      nomeCompleto: 'João Atualizado',
      papel: PapelUsuario.ADMINISTRADOR,
      requisitanteId: requisitanteId.toString(),
    })

    expect(resultado.nomeCompleto).toBe('João Atualizado')
    expect(atualizarFn).toHaveBeenCalledOnce()
  })

  it('deve editar visitante recém-cadastrado como recepcionista (dentro de 30 min)', async () => {
    const visitante = criarVisitanteMock(new Date())
    const repositorio = criarRepositorioMock(visitante)
    const casoDeUso = new EditarVisitante(repositorio)

    await expect(
      casoDeUso.executar({
        id: visitante.id.toString(),
        telefone: '11888887777',
        papel: PapelUsuario.RECEPCIONISTA,
        requisitanteId: requisitanteId.toString(),
      }),
    ).resolves.not.toThrow()
  })

  it('deve lançar ErroVisitanteNaoPodeSerEditado para recepcionista após 30 min', async () => {
    const criadoHaMuito = new Date(Date.now() - 31 * 60 * 1000)
    const visitante = criarVisitanteMock(criadoHaMuito)
    const repositorio = criarRepositorioMock(visitante)
    const casoDeUso = new EditarVisitante(repositorio)

    await expect(
      casoDeUso.executar({
        id: visitante.id.toString(),
        nomeCompleto: 'Tentativa',
        papel: PapelUsuario.RECEPCIONISTA,
        requisitanteId: requisitanteId.toString(),
      }),
    ).rejects.toThrow(ErroVisitanteNaoPodeSerEditado)
  })

  it('deve lançar ErroVisitanteNaoEncontrado quando visitante não existe', async () => {
    const repositorio = criarRepositorioMock(null)
    const casoDeUso = new EditarVisitante(repositorio)

    await expect(
      casoDeUso.executar({
        id: new ObjectId().toString(),
        nomeCompleto: 'Qualquer',
        papel: PapelUsuario.ADMINISTRADOR,
        requisitanteId: requisitanteId.toString(),
      }),
    ).rejects.toThrow(ErroVisitanteNaoEncontrado)
  })

  it('não deve chamar atualizar quando visitante não é encontrado', async () => {
    const atualizarFn = vi.fn().mockResolvedValue(undefined)
    const repositorioSemVisitante: RepositorioVisitante = {
      criar: vi.fn(), buscarPorId: vi.fn().mockResolvedValue(null), buscarPorCpfEData: vi.fn(),
      atualizar: atualizarFn, listarHoje: vi.fn(), buscarHistorico: vi.fn(),
    }
    const casoSemVisitante = new EditarVisitante(repositorioSemVisitante)

    await casoSemVisitante.executar({
      id: new ObjectId().toString(),
      nomeCompleto: 'Qualquer',
      papel: PapelUsuario.ADMINISTRADOR,
      requisitanteId: requisitanteId.toString(),
    }).catch(() => undefined)

    expect(atualizarFn).not.toHaveBeenCalled()
  })

  it('deve converter dataNascimento string para Date quando informada — branch ternário true', async () => {
    const visitante = criarVisitanteMock()
    const repositorio = criarRepositorioMock(visitante)
    const casoDeUso = new EditarVisitante(repositorio)

    const resultado = await casoDeUso.executar({
      id: visitante.id.toString(),
      dataNascimento: '1995-08-20',
      papel: PapelUsuario.ADMINISTRADOR,
      requisitanteId: requisitanteId.toString(),
    })

    expect(resultado.dataNascimento).toBeTruthy()
  })

  it('deve omitir dataNascimento quando não informada — branch ternário false (undefined)', async () => {
    const visitante = criarVisitanteMock()
    const atualizarSpy = vi.fn().mockResolvedValue(undefined)
    const repositorio: RepositorioVisitante = {
      criar: vi.fn(), buscarPorId: vi.fn().mockResolvedValue(visitante), buscarPorCpfEData: vi.fn(),
      atualizar: atualizarSpy, listarHoje: vi.fn(), buscarHistorico: vi.fn(),
    }
    const casoDeUso = new EditarVisitante(repositorio)

    await casoDeUso.executar({
      id: visitante.id.toString(),
      nomeCompleto: 'Sem data',
      papel: PapelUsuario.ADMINISTRADOR,
      requisitanteId: requisitanteId.toString(),
    })

    expect(atualizarSpy).toHaveBeenCalledOnce()
  })

  it('deve converter setorDestinoId string para ObjectId quando informado — branch ternário true', async () => {
    const visitante = criarVisitanteMock()
    const repositorio = criarRepositorioMock(visitante)
    const casoDeUso = new EditarVisitante(repositorio)
    const novoSetorId = new ObjectId().toString()

    const resultado = await casoDeUso.executar({
      id: visitante.id.toString(),
      setorDestinoId: novoSetorId,
      papel: PapelUsuario.ADMINISTRADOR,
      requisitanteId: requisitanteId.toString(),
    })

    expect(resultado.setorDestinoId).toBe(novoSetorId)
  })

  it('deve omitir setorDestinoId quando não informado — branch ternário false (undefined)', async () => {
    const visitante = criarVisitanteMock()
    const atualizarSpy = vi.fn().mockResolvedValue(undefined)
    const repositorio: RepositorioVisitante = {
      criar: vi.fn(), buscarPorId: vi.fn().mockResolvedValue(visitante), buscarPorCpfEData: vi.fn(),
      atualizar: atualizarSpy, listarHoje: vi.fn(), buscarHistorico: vi.fn(),
    }
    const casoDeUso = new EditarVisitante(repositorio)

    await casoDeUso.executar({
      id: visitante.id.toString(),
      nomeCompleto: 'Sem setor',
      papel: PapelUsuario.ADMINISTRADOR,
      requisitanteId: requisitanteId.toString(),
    })

    expect(atualizarSpy).toHaveBeenCalledOnce()
  })
})
