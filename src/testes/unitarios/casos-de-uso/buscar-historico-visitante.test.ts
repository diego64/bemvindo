import { describe, it, expect, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { BuscarHistoricoVisitante } from '@/modulos/visitantes/aplicacao/casos-de-uso/buscar-historico-visitante'
import { ErroFiltroObrigatorio } from '@/compartilhado/erros/erro-filtro-obrigatorio'
import type { RepositorioVisitante } from '@/modulos/visitantes/dominio/repositorios/repositorio-visitante'
import { Visitante } from '@/modulos/visitantes/dominio/entidades/visitante'

function criarVisitanteMock(): Visitante {
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
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    criadoPor: recepId,
    atualizadoPor: recepId,
  })
}

function criarRepositorioMock(visitantes: Visitante[] = [], total = 0): RepositorioVisitante {
  return {
    criar: vi.fn(),
    buscarPorId: vi.fn(),
    buscarPorCpfEData: vi.fn(),
    atualizar: vi.fn(),
    listarHoje: vi.fn(),
    buscarHistorico: vi.fn().mockResolvedValue({ visitantes, total }),
  }
}

describe('BuscarHistoricoVisitante', () => {
  it('deve retornar histórico paginado filtrado por CPF', async () => {
    const visitantes = [criarVisitanteMock()]
    const repositorio = criarRepositorioMock(visitantes, 1)
    const casoDeUso = new BuscarHistoricoVisitante(repositorio)

    const resultado = await casoDeUso.executar({ cpf: '529.982.247-25', pagina: 1, itensPorPagina: 20 })

    expect(resultado.dados).toHaveLength(1)
    expect(resultado.paginacao.total).toBe(1)
  })

  it('deve retornar histórico paginado filtrado por nomeCompleto', async () => {
    const repositorio = criarRepositorioMock([criarVisitanteMock()], 1)
    const casoDeUso = new BuscarHistoricoVisitante(repositorio)

    const resultado = await casoDeUso.executar({ nomeCompleto: 'João', pagina: 1, itensPorPagina: 20 })

    expect(resultado.dados).toHaveLength(1)
  })

  it('deve lançar ErroFiltroObrigatorio quando nenhum filtro é informado', async () => {
    const repositorio = criarRepositorioMock()
    const casoDeUso = new BuscarHistoricoVisitante(repositorio)

    await expect(casoDeUso.executar({ pagina: 1, itensPorPagina: 20 })).rejects.toThrow(ErroFiltroObrigatorio)
  })

  it('deve normalizar CPF removendo formatação antes de repassar ao repositório', async () => {
    const repositorio = criarRepositorioMock()
    const casoDeUso = new BuscarHistoricoVisitante(repositorio)

    await casoDeUso.executar({ cpf: '529.982.247-25', pagina: 1, itensPorPagina: 20 })

    const chamada = (repositorio.buscarHistorico as ReturnType<typeof vi.fn>).mock.calls[0][0] as { cpf?: string }
    expect(chamada.cpf).toBe('52998224725')
  })

  it('deve calcular totalPaginas corretamente', async () => {
    const repositorio = criarRepositorioMock([], 50)
    const casoDeUso = new BuscarHistoricoVisitante(repositorio)

    const resultado = await casoDeUso.executar({ cpf: '52998224725', pagina: 1, itensPorPagina: 10 })

    expect(resultado.paginacao.totalPaginas).toBe(5)
  })

  it('deve repassar pagina e itensPorPagina ao repositório', async () => {
    const repositorio = criarRepositorioMock()
    const casoDeUso = new BuscarHistoricoVisitante(repositorio)

    await casoDeUso.executar({ nomeCompleto: 'João', pagina: 2, itensPorPagina: 10 })

    const chamada = (repositorio.buscarHistorico as ReturnType<typeof vi.fn>).mock.calls[0][0] as { pagina: number; itensPorPagina: number }
    expect(chamada.pagina).toBe(2)
    expect(chamada.itensPorPagina).toBe(10)
  })

  it('não deve chamar repositório quando nenhum filtro é informado', async () => {
    const buscarHistoricoFn = vi.fn().mockResolvedValue({ visitantes: [], total: 0 })
    const repositorioVazio: RepositorioVisitante = {
      criar: vi.fn(), buscarPorId: vi.fn(), buscarPorCpfEData: vi.fn(),
      atualizar: vi.fn(), listarHoje: vi.fn(), buscarHistorico: buscarHistoricoFn,
    }
    const casoSemFiltro = new BuscarHistoricoVisitante(repositorioVazio)

    await casoSemFiltro.executar({ pagina: 1, itensPorPagina: 20 }).catch(() => undefined)

    expect(buscarHistoricoFn).not.toHaveBeenCalled()
  })
})
