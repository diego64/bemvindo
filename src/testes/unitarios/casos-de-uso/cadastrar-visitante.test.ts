import { describe, it, expect, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { CadastrarVisitante } from '@/modulos/visitantes/aplicacao/casos-de-uso/cadastrar-visitante'
import { ErroVisitanteJaCadastradoHoje } from '@/compartilhado/erros/erro-visitante-ja-cadastrado-hoje'
import { ErroForaDoHorarioPermitido } from '@/compartilhado/erros/erro-fora-do-horario-permitido'
import { ErroDiaNaoPermitido } from '@/compartilhado/erros/erro-dia-nao-permitido'
import { ErroCpfInvalido } from '@/compartilhado/erros/erro-cpf-invalido'
import type { RepositorioVisitante } from '@/modulos/visitantes/dominio/repositorios/repositorio-visitante'
import type { RepositorioContador } from '@/compartilhado/repositorios/repositorio-contador'
import type { RepositorioUsuario } from '@/modulos/usuarios/dominio/repositorios/repositorio-usuario'
import type { ServicoDominioVisitante } from '@/modulos/visitantes/dominio/servicos/servico-dominio-visitante'
import { Visitante } from '@/modulos/visitantes/dominio/entidades/visitante'
import { Usuario } from '@/modulos/usuarios/dominio/entidades/usuario'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'

const recepcionistaId = new ObjectId()
const setorId = new ObjectId()

function criarUsuarioMock(): Usuario {
  return new Usuario({
    id: recepcionistaId,
    nome: 'Recep',
    sobrenome: 'Teste',
    telefone: '11999999999',
    email: 'recep@teste.com',
    senhaHash: 'hash',
    matricula: 'RECEP0000001',
    papel: PapelUsuario.RECEPCIONISTA,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    criadoPor: recepcionistaId,
    atualizadoPor: recepcionistaId,
  })
}

function criarVisitanteMock(): Visitante {
  return new Visitante({
    id: new ObjectId(),
    codigoVisitante: 'VIST0000001',
    cpf: '52998224725',
    nomeCompleto: 'João Silva',
    dataNascimento: new Date('1990-01-01'),
    telefone: '11999999999',
    email: 'joao@email.com',
    setorDestinoId: setorId,
    recepcionistaId,
    recepcionistaNome: 'Recep Teste',
    recepcionistaMatricula: 'RECEP0000001',
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    criadoPor: recepcionistaId,
    atualizadoPor: recepcionistaId,
  })
}

function criarMocks(visitanteExistente: Visitante | null = null) {
  const repositorioVisitante: RepositorioVisitante = {
    criar: vi.fn().mockResolvedValue(undefined),
    buscarPorId: vi.fn().mockResolvedValue(null),
    buscarPorCpfEData: vi.fn().mockResolvedValue(visitanteExistente),
    atualizar: vi.fn().mockResolvedValue(undefined),
    listarHoje: vi.fn().mockResolvedValue({ visitantes: [], total: 0 }),
    buscarHistorico: vi.fn().mockResolvedValue({ visitantes: [], total: 0 }),
  }
  const repositorioContador: RepositorioContador = {
    proximoNumero: vi.fn().mockResolvedValue(1),
  }
  const repositorioUsuario: RepositorioUsuario = {
    criar: vi.fn(),
    buscarPorEmail: vi.fn().mockResolvedValue(null),
    buscarPorId: vi.fn().mockResolvedValue(criarUsuarioMock()),
    listar: vi.fn().mockResolvedValue({ usuarios: [], total: 0 }),
    atualizar: vi.fn(),
  }
  const servicoDominio: ServicoDominioVisitante = {
    validarHorarioPermitido: vi.fn(),
    validarDiaPermitido: vi.fn(),
    obterIntervaloHoje: vi.fn().mockReturnValue({ inicioDia: new Date(), fimDia: new Date() }),
  }
  return { repositorioVisitante, repositorioContador, repositorioUsuario, servicoDominio }
}

const entradaValida = {
  nomeCompleto: 'João Silva',
  cpf: '529.982.247-25',
  dataNascimento: '1990-01-01',
  telefone: '11999999999',
  email: 'joao@email.com',
  setorDestinoId: setorId.toString(),
  requisitanteId: recepcionistaId.toString(),
}

describe('CadastrarVisitante', () => {
  it('deve cadastrar com sucesso e retornar DTO', async () => {
    const criarFn = vi.fn().mockResolvedValue(undefined)
    const { repositorioContador, repositorioUsuario, servicoDominio } = criarMocks()
    const repositorioVisitante: RepositorioVisitante = {
      criar: criarFn,
      buscarPorId: vi.fn().mockResolvedValue(null),
      buscarPorCpfEData: vi.fn().mockResolvedValue(null),
      atualizar: vi.fn().mockResolvedValue(undefined),
      listarHoje: vi.fn().mockResolvedValue({ visitantes: [], total: 0 }),
      buscarHistorico: vi.fn().mockResolvedValue({ visitantes: [], total: 0 }),
    }
    const casoDeUso = new CadastrarVisitante(repositorioVisitante, repositorioContador, repositorioUsuario, servicoDominio)

    const resultado = await casoDeUso.executar(entradaValida)

    expect(resultado.codigoVisitante).toBe('VIST0000001')
    expect(resultado.nomeCompleto).toBe('João Silva')
    expect(resultado.cpf).toBe('52998224725')
    expect(criarFn).toHaveBeenCalledOnce()
  })

  it('deve lançar ErroVisitanteJaCadastradoHoje quando CPF já cadastrado hoje', async () => {
    const { repositorioVisitante, repositorioContador, repositorioUsuario, servicoDominio } = criarMocks(criarVisitanteMock())
    const casoDeUso = new CadastrarVisitante(repositorioVisitante, repositorioContador, repositorioUsuario, servicoDominio)

    await expect(casoDeUso.executar(entradaValida)).rejects.toThrow(ErroVisitanteJaCadastradoHoje)
  })

  it('deve lançar ErroForaDoHorarioPermitido quando fora do horário', async () => {
    const { repositorioVisitante, repositorioContador, repositorioUsuario, servicoDominio } = criarMocks()
    ;(servicoDominio.validarHorarioPermitido as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new ErroForaDoHorarioPermitido()
    })
    const casoDeUso = new CadastrarVisitante(repositorioVisitante, repositorioContador, repositorioUsuario, servicoDominio)

    await expect(casoDeUso.executar(entradaValida)).rejects.toThrow(ErroForaDoHorarioPermitido)
  })

  it('deve lançar ErroDiaNaoPermitido em fim de semana ou feriado', async () => {
    const { repositorioVisitante, repositorioContador, repositorioUsuario, servicoDominio } = criarMocks()
    ;(servicoDominio.validarDiaPermitido as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new ErroDiaNaoPermitido()
    })
    const casoDeUso = new CadastrarVisitante(repositorioVisitante, repositorioContador, repositorioUsuario, servicoDominio)

    await expect(casoDeUso.executar(entradaValida)).rejects.toThrow(ErroDiaNaoPermitido)
  })

  it('deve lançar ErroCpfInvalido para CPF com dígitos inválidos', async () => {
    const { repositorioVisitante, repositorioContador, repositorioUsuario, servicoDominio } = criarMocks()
    const casoDeUso = new CadastrarVisitante(repositorioVisitante, repositorioContador, repositorioUsuario, servicoDominio)

    await expect(casoDeUso.executar({ ...entradaValida, cpf: '111.111.111-11' })).rejects.toThrow(ErroCpfInvalido)
  })

  it('deve normalizar CPF removendo formatação antes de verificar unicidade', async () => {
    const buscarFn = vi.fn().mockResolvedValue(null)
    const { repositorioContador, repositorioUsuario, servicoDominio } = criarMocks()
    const repositorioVisitante: RepositorioVisitante = {
      criar: vi.fn().mockResolvedValue(undefined),
      buscarPorId: vi.fn().mockResolvedValue(null),
      buscarPorCpfEData: buscarFn,
      atualizar: vi.fn().mockResolvedValue(undefined),
      listarHoje: vi.fn().mockResolvedValue({ visitantes: [], total: 0 }),
      buscarHistorico: vi.fn().mockResolvedValue({ visitantes: [], total: 0 }),
    }
    const casoDeUso = new CadastrarVisitante(repositorioVisitante, repositorioContador, repositorioUsuario, servicoDominio)

    await casoDeUso.executar(entradaValida)

    const chamada = buscarFn.mock.calls[0] as [string, Date, Date]
    expect(chamada[0]).toBe('52998224725')
  })
})
