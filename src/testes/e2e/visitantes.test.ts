import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { ObjectId } from 'mongodb'
import type { FastifyInstance } from 'fastify'
import type { Db } from 'mongodb'
import { criarAplicacao } from '@/infra/http/aplicacao'
import { RepositorioUsuarioMongo } from '@/modulos/usuarios/infra/repositorios/repositorio-usuario-mongo'
import { RepositorioContadorMongo } from '@/infra/bd/repositorio-contador-mongo'
import { CadastrarUsuario } from '@/modulos/usuarios/aplicacao/casos-de-uso/cadastrar-usuario'
import { ListarUsuarios } from '@/modulos/usuarios/aplicacao/casos-de-uso/listar-usuarios'
import { AtualizarUsuario } from '@/modulos/usuarios/aplicacao/casos-de-uso/atualizar-usuario'
import { ControladorUsuario } from '@/modulos/usuarios/apresentacao/controladores/controlador-usuario'
import { rotasUsuario } from '@/modulos/usuarios/apresentacao/rotas/rotas-usuario'
import { RepositorioSetorMongo } from '@/modulos/setores/infra/repositorios/repositorio-setor-mongo'
import { RepositorioVisitanteMongo } from '@/modulos/visitantes/infra/repositorios/repositorio-visitante-mongo'
import { ServicoDominioVisitante } from '@/modulos/visitantes/dominio/servicos/servico-dominio-visitante'
import { CadastrarVisitante } from '@/modulos/visitantes/aplicacao/casos-de-uso/cadastrar-visitante'
import { EditarVisitante } from '@/modulos/visitantes/aplicacao/casos-de-uso/editar-visitante'
import { ListarVisitantesHoje } from '@/modulos/visitantes/aplicacao/casos-de-uso/listar-visitantes-hoje'
import { BuscarHistoricoVisitante } from '@/modulos/visitantes/aplicacao/casos-de-uso/buscar-historico-visitante'
import { ControladorVisitante } from '@/modulos/visitantes/apresentacao/controladores/controlador-visitante'
import { rotasVisitante } from '@/modulos/visitantes/apresentacao/rotas/rotas-visitante'
import {
  conectarBdTeste,
  desconectarBdTeste,
  limparColecao,
  criarAdminTeste,
  criarRecepcionistaTeste,
  criarSetorTeste,
  criarVisitanteTeste,
} from '@/testes/auxiliares/auxiliar-bd'

class ServicoDominioVisitanteStub extends ServicoDominioVisitante {
  override validarHorarioPermitido(data: Date): void {
    void data
  }
  override validarDiaPermitido(data: Date): void {
    void data
  }
}

let app: FastifyInstance
let bd: Db
let tokenAdmin: string
let tokenRecep: string
let adminId: ObjectId
let recepId: ObjectId
let recepMatricula: string
let setorId: ObjectId

beforeAll(async () => {
  process.env.JWT_SECRETO = 'jwt-secreto-de-teste-com-pelo-menos-32-chars'
  process.env.NODE_ENV = 'test'

  bd = await conectarBdTeste()
  app = await criarAplicacao()

  const repositorioUsuario = new RepositorioUsuarioMongo(bd)
  const repositorioContador = new RepositorioContadorMongo(bd)
  const repositorioSetor = new RepositorioSetorMongo(bd)
  const repositorioVisitante = new RepositorioVisitanteMongo(bd)

  await repositorioUsuario.criarIndices()
  await repositorioSetor.criarIndices()
  await repositorioVisitante.criarIndices()

  await app.register(rotasUsuario, {
    prefix: '/usuarios',
    controlador: new ControladorUsuario(
      new CadastrarUsuario(repositorioUsuario, repositorioContador),
      new ListarUsuarios(repositorioUsuario),
      new AtualizarUsuario(repositorioUsuario),
    ),
  })

  const servicoDominio = new ServicoDominioVisitanteStub()

  await app.register(rotasVisitante, {
    prefix: '/visitantes',
    controlador: new ControladorVisitante(
      new CadastrarVisitante(repositorioVisitante, repositorioContador, repositorioUsuario, repositorioSetor, servicoDominio),
      new EditarVisitante(repositorioVisitante),
      new ListarVisitantesHoje(repositorioVisitante, servicoDominio),
      new BuscarHistoricoVisitante(repositorioVisitante),
    ),
  })

  await app.ready()
})

afterAll(async () => {
  await limparColecao(bd, 'usuarios')
  await limparColecao(bd, 'contadores')
  await limparColecao(bd, 'setores')
  await limparColecao(bd, 'visitantes')
  await app.close()
  await desconectarBdTeste()
})

beforeEach(async () => {
  await limparColecao(bd, 'usuarios')
  await limparColecao(bd, 'contadores')
  await limparColecao(bd, 'setores')
  await limparColecao(bd, 'visitantes')

  const admin = await criarAdminTeste(bd, app)
  tokenAdmin = admin.token
  adminId = admin.id

  const recep = await criarRecepcionistaTeste(bd, app)
  tokenRecep = recep.token
  recepId = recep.id
  recepMatricula = recep.matricula

  setorId = await criarSetorTeste(bd, adminId)
})

const payloadValido = () => ({
  nomeCompleto: 'João da Silva',
  cpf: '529.982.247-25',
  dataNascimento: '1990-06-15',
  telefone: '11999999999',
  email: 'joao@email.com',
  setorDestinoNome: 'TI Teste',
})

describe('POST /visitantes', () => {
  it('deve retornar 201 ao cadastrar com sucesso (admin)', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/visitantes',
      payload: payloadValido(),
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    expect(resposta.statusCode).toBe(201)
    const corpo = resposta.json<{ sucesso: boolean; dados: { codigoVisitante: string; cpf: string } }>()
    expect(corpo.sucesso).toBe(true)
    expect(corpo.dados.codigoVisitante).toMatch(/^VIST\d{7}$/)
    expect(corpo.dados.cpf).toBe('52998224725')
  })

  it('deve retornar 201 ao cadastrar com token de recepcionista', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/visitantes',
      payload: payloadValido(),
      headers: { authorization: `Bearer ${tokenRecep}` },
    })

    expect(resposta.statusCode).toBe(201)
  })

  it('deve retornar 409 quando CPF já cadastrado hoje', async () => {
    await criarVisitanteTeste(bd, setorId, recepId, recepMatricula, '52998224725')

    const resposta = await app.inject({
      method: 'POST',
      url: '/visitantes',
      payload: payloadValido(),
      headers: { authorization: `Bearer ${tokenRecep}` },
    })

    expect(resposta.statusCode).toBe(409)
    expect(resposta.json<{ erro: { codigo: string } }>().erro.codigo).toBe('VISITANTE_JA_CADASTRADO_HOJE')
  })

  it('deve retornar 400 para CPF com formato inválido', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/visitantes',
      payload: { ...payloadValido(), cpf: '123' },
      headers: { authorization: `Bearer ${tokenRecep}` },
    })

    expect(resposta.statusCode).toBe(400)
  })

  it('deve retornar 400 para CPF com dígitos verificadores inválidos', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/visitantes',
      payload: { ...payloadValido(), cpf: '111.111.111-11' },
      headers: { authorization: `Bearer ${tokenRecep}` },
    })

    expect(resposta.statusCode).toBe(400)
  })

  it('deve retornar 401 sem autenticação', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/visitantes',
      payload: payloadValido(),
    })

    expect(resposta.statusCode).toBe(401)
  })
})

describe('PATCH /visitantes/:id', () => {
  it('deve retornar 200 ao editar com sucesso (admin, sem limite de tempo)', async () => {
    const criadoHaMuito = new Date(Date.now() - 60 * 60 * 1000)
    const visitanteId = await criarVisitanteTeste(bd, setorId, adminId, 'RECEP0000001', '52998224725', criadoHaMuito)

    const resposta = await app.inject({
      method: 'PATCH',
      url: `/visitantes/${visitanteId.toString()}`,
      payload: { nomeCompleto: 'João Atualizado' },
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    expect(resposta.statusCode).toBe(200)
    expect(resposta.json<{ dados: { nomeCompleto: string } }>().dados.nomeCompleto).toBe('João Atualizado')
  })

  it('deve retornar 200 ao editar dentro de 30 min (recepcionista)', async () => {
    const visitanteId = await criarVisitanteTeste(bd, setorId, recepId, recepMatricula)

    const resposta = await app.inject({
      method: 'PATCH',
      url: `/visitantes/${visitanteId.toString()}`,
      payload: { telefone: '11988888888' },
      headers: { authorization: `Bearer ${tokenRecep}` },
    })

    expect(resposta.statusCode).toBe(200)
  })

  it('deve retornar 403 quando recepcionista tenta editar após 30 min', async () => {
    const criadoHaMuito = new Date(Date.now() - 31 * 60 * 1000)
    const visitanteId = await criarVisitanteTeste(bd, setorId, recepId, recepMatricula, '52998224725', criadoHaMuito)

    const resposta = await app.inject({
      method: 'PATCH',
      url: `/visitantes/${visitanteId.toString()}`,
      payload: { nomeCompleto: 'Tentativa' },
      headers: { authorization: `Bearer ${tokenRecep}` },
    })

    expect(resposta.statusCode).toBe(403)
    expect(resposta.json<{ erro: { codigo: string } }>().erro.codigo).toBe('VISITANTE_NAO_PODE_SER_EDITADO')
  })

  it('deve retornar 404 para visitante inexistente', async () => {
    const resposta = await app.inject({
      method: 'PATCH',
      url: `/visitantes/${new ObjectId().toString()}`,
      payload: { nomeCompleto: 'Qualquer' },
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    expect(resposta.statusCode).toBe(404)
  })

  it('deve retornar 401 sem autenticação', async () => {
    const resposta = await app.inject({
      method: 'PATCH',
      url: `/visitantes/${new ObjectId().toString()}`,
      payload: { nomeCompleto: 'Qualquer' },
    })

    expect(resposta.statusCode).toBe(401)
  })
})

describe('GET /visitantes/hoje', () => {
  it('deve retornar 200 com visitantes do dia', async () => {
    await criarVisitanteTeste(bd, setorId, adminId, 'RECEP0000001', '52998224725', new Date(), 1)
    await criarVisitanteTeste(bd, setorId, adminId, 'RECEP0000001', '11144477735', new Date(), 2)

    const resposta = await app.inject({
      method: 'GET',
      url: '/visitantes/hoje',
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    expect(resposta.statusCode).toBe(200)
    const corpo = resposta.json<{ sucesso: boolean; dados: unknown[]; paginacao: { total: number } }>()
    expect(corpo.sucesso).toBe(true)
    expect(corpo.paginacao.total).toBe(2)
  })

  it('deve filtrar por nomeCompleto', async () => {
    await criarVisitanteTeste(bd, setorId, adminId, 'RECEP0000001', '52998224725')

    const resposta = await app.inject({
      method: 'GET',
      url: '/visitantes/hoje?nomeCompleto=Visitante',
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    expect(resposta.statusCode).toBe(200)
    expect(resposta.json<{ paginacao: { total: number } }>().paginacao.total).toBe(1)
  })

  it('deve retornar lista vazia quando sem visitantes hoje', async () => {
    const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000)
    await criarVisitanteTeste(bd, setorId, adminId, 'RECEP0000001', '52998224725', ontem)

    const resposta = await app.inject({
      method: 'GET',
      url: '/visitantes/hoje',
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    expect(resposta.statusCode).toBe(200)
    expect(resposta.json<{ paginacao: { total: number } }>().paginacao.total).toBe(0)
  })

  it('deve retornar 401 sem autenticação', async () => {
    const resposta = await app.inject({ method: 'GET', url: '/visitantes/hoje' })
    expect(resposta.statusCode).toBe(401)
  })
})

describe('GET /visitantes', () => {
  it('deve retornar histórico filtrado por CPF', async () => {
    await criarVisitanteTeste(bd, setorId, adminId, 'RECEP0000001', '52998224725')

    const resposta = await app.inject({
      method: 'GET',
      url: '/visitantes?cpf=529.982.247-25',
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    expect(resposta.statusCode).toBe(200)
    const corpo = resposta.json<{ paginacao: { total: number } }>()
    expect(corpo.paginacao.total).toBe(1)
  })

  it('deve retornar histórico filtrado por nomeCompleto (parcial)', async () => {
    await criarVisitanteTeste(bd, setorId, adminId, 'RECEP0000001', '52998224725')

    const resposta = await app.inject({
      method: 'GET',
      url: '/visitantes?nomeCompleto=Visitante',
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    expect(resposta.statusCode).toBe(200)
    expect(resposta.json<{ paginacao: { total: number } }>().paginacao.total).toBe(1)
  })

  it('deve retornar 400 sem filtros', async () => {
    const resposta = await app.inject({
      method: 'GET',
      url: '/visitantes',
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    expect(resposta.statusCode).toBe(400)
  })

  it('deve retornar 401 sem autenticação', async () => {
    const resposta = await app.inject({ method: 'GET', url: '/visitantes?cpf=529.982.247-25' })
    expect(resposta.statusCode).toBe(401)
  })
})
