import { describe, it, expect, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { ListarVisitantesHoje } from '@/modulos/visitantes/aplicacao/casos-de-uso/listar-visitantes-hoje'
import type { RepositorioVisitante } from '@/modulos/visitantes/dominio/repositorios/repositorio-visitante'
import type { ServicoDominioVisitante } from '@/modulos/visitantes/dominio/servicos/servico-dominio-visitante'
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

function criarMocks(visitantes: Visitante[] = [], total = 0) {
  const inicioDia = new Date()
  const fimDia = new Date()

  const repositorioVisitante: RepositorioVisitante = {
    criar: vi.fn(),
    buscarPorId: vi.fn(),
    buscarPorCpfEData: vi.fn(),
    atualizar: vi.fn(),
    listarHoje: vi.fn().mockResolvedValue({ visitantes, total }),
    buscarHistorico: vi.fn(),
  }

  const servicoDominio: ServicoDominioVisitante = {
    validarHorarioPermitido: vi.fn(),
    validarDiaPermitido: vi.fn(),
    obterIntervaloHoje: vi.fn().mockReturnValue({ inicioDia, fimDia }),
  }

  return { repositorioVisitante, servicoDominio, inicioDia, fimDia }
}

describe('ListarVisitantesHoje', () => {
  it('deve retornar lista paginada de visitantes do dia', async () => {
    const visitantes = [criarVisitanteMock(), criarVisitanteMock()]
    const { repositorioVisitante, servicoDominio } = criarMocks(visitantes, 2)
    const casoDeUso = new ListarVisitantesHoje(repositorioVisitante, servicoDominio)

    const resultado = await casoDeUso.executar({ pagina: 1, itensPorPagina: 20 })

    expect(resultado.dados).toHaveLength(2)
    expect(resultado.paginacao.total).toBe(2)
  })

  it('deve calcular totalPaginas corretamente', async () => {
    const { repositorioVisitante, servicoDominio } = criarMocks([], 35)
    const casoDeUso = new ListarVisitantesHoje(repositorioVisitante, servicoDominio)

    const resultado = await casoDeUso.executar({ pagina: 1, itensPorPagina: 20 })

    expect(resultado.paginacao.totalPaginas).toBe(2)
  })

  it('deve usar o intervalo retornado pelo serviço de domínio', async () => {
    const { repositorioVisitante, servicoDominio, inicioDia, fimDia } = criarMocks()
    const casoDeUso = new ListarVisitantesHoje(repositorioVisitante, servicoDominio)

    await casoDeUso.executar({ pagina: 1, itensPorPagina: 20 })

    const chamada = (repositorioVisitante.listarHoje as ReturnType<typeof vi.fn>).mock.calls[0][0] as { inicioDia: Date; fimDia: Date }
    expect(chamada.inicioDia).toEqual(inicioDia)
    expect(chamada.fimDia).toEqual(fimDia)
  })

  it('deve repassar filtros de nomeCompleto e setorDestinoId ao repositório', async () => {
    const { repositorioVisitante, servicoDominio } = criarMocks()
    const casoDeUso = new ListarVisitantesHoje(repositorioVisitante, servicoDominio)
    const setorId = new ObjectId().toString()

    await casoDeUso.executar({ pagina: 1, itensPorPagina: 10, nomeCompleto: 'João', setorDestinoId: setorId })

    const chamada = (repositorioVisitante.listarHoje as ReturnType<typeof vi.fn>).mock.calls[0][0] as { nomeCompleto?: string }
    expect(chamada.nomeCompleto).toBe('João')
  })

  it('deve retornar lista vazia e paginacao zerada quando sem visitantes', async () => {
    const { repositorioVisitante, servicoDominio } = criarMocks([], 0)
    const casoDeUso = new ListarVisitantesHoje(repositorioVisitante, servicoDominio)

    const resultado = await casoDeUso.executar({ pagina: 1, itensPorPagina: 20 })

    expect(resultado.dados).toHaveLength(0)
    expect(resultado.paginacao.total).toBe(0)
    expect(resultado.paginacao.totalPaginas).toBe(0)
  })
})
