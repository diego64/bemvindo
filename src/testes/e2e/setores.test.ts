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
import { CadastrarSetor } from '@/modulos/setores/aplicacao/casos-de-uso/cadastrar-setor'
import { ListarSetores } from '@/modulos/setores/aplicacao/casos-de-uso/listar-setores'
import { ControladorSetor } from '@/modulos/setores/apresentacao/controladores/controlador-setor'
import { rotasSetor } from '@/modulos/setores/apresentacao/rotas/rotas-setor'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'
import {
  conectarBdTeste,
  desconectarBdTeste,
  limparColecao,
  criarAdminTeste,
} from '@/testes/auxiliares/auxiliar-bd'

let app: FastifyInstance
let bd: Db
let tokenAdmin: string
let tokenRecep: string

beforeAll(async () => {
  process.env.JWT_SECRETO = 'jwt-secreto-de-teste-com-pelo-menos-32-chars'
  process.env.NODE_ENV = 'test'

  bd = await conectarBdTeste()
  app = await criarAplicacao()

  const repositorioUsuario = new RepositorioUsuarioMongo(bd)
  const repositorioContador = new RepositorioContadorMongo(bd)
  const repositorioSetor = new RepositorioSetorMongo(bd)

  await repositorioUsuario.criarIndices()
  await repositorioSetor.criarIndices()

  await app.register(rotasUsuario, {
    prefix: '/usuarios',
    controlador: new ControladorUsuario(
      new CadastrarUsuario(repositorioUsuario, repositorioContador),
      new ListarUsuarios(repositorioUsuario),
      new AtualizarUsuario(repositorioUsuario),
    ),
  })

  await app.register(rotasSetor, {
    prefix: '/setores',
    controlador: new ControladorSetor(
      new CadastrarSetor(repositorioSetor),
      new ListarSetores(repositorioSetor),
    ),
  })

  await app.ready()
})

afterAll(async () => {
  await limparColecao(bd, 'usuarios')
  await limparColecao(bd, 'contadores')
  await limparColecao(bd, 'setores')
  await app.close()
  await desconectarBdTeste()
})

beforeEach(async () => {
  await limparColecao(bd, 'usuarios')
  await limparColecao(bd, 'contadores')
  await limparColecao(bd, 'setores')

  const admin = await criarAdminTeste(bd, app)
  tokenAdmin = admin.token

  tokenRecep = app.jwt.sign({
    usuarioId: new ObjectId().toString(),
    email: 'recep@teste.com',
    papel: PapelUsuario.RECEPCIONISTA,
  })
})

describe('POST /setores', () => {
  it('deve retornar 201 com dados do setor criado', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/setores',
      payload: { nome: 'Recursos Humanos' },
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    expect(resposta.statusCode).toBe(201)
    const corpo = resposta.json<{ sucesso: boolean; dados: { nome: string; id: string } }>()
    expect(corpo.sucesso).toBe(true)
    expect(corpo.dados.nome).toBe('Recursos Humanos')
    expect(corpo.dados.id).toBeTruthy()
  })

  it('deve retornar 409 quando nome já está cadastrado', async () => {
    await app.inject({
      method: 'POST',
      url: '/setores',
      payload: { nome: 'TI' },
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    const resposta = await app.inject({
      method: 'POST',
      url: '/setores',
      payload: { nome: 'TI' },
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    expect(resposta.statusCode).toBe(409)
    expect(resposta.json<{ erro: { codigo: string } }>().erro.codigo).toBe(
      'NOME_SETOR_JA_CADASTRADO',
    )
  })

  it('deve retornar 403 quando autenticado como RECEPCIONISTA', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/setores',
      payload: { nome: 'Financeiro' },
      headers: { authorization: `Bearer ${tokenRecep}` },
    })

    expect(resposta.statusCode).toBe(403)
  })

  it('deve retornar 401 sem token de autenticação', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/setores',
      payload: { nome: 'Financeiro' },
    })

    expect(resposta.statusCode).toBe(401)
  })

  it('deve retornar 400 para nome inválido (menos de 2 caracteres)', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/setores',
      payload: { nome: 'A' },
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    expect(resposta.statusCode).toBe(400)
  })
})

describe('GET /setores', () => {
  it('deve retornar 200 com lista completa de setores', async () => {
    await app.inject({
      method: 'POST',
      url: '/setores',
      payload: { nome: 'TI' },
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })
    await app.inject({
      method: 'POST',
      url: '/setores',
      payload: { nome: 'RH' },
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    const resposta = await app.inject({
      method: 'GET',
      url: '/setores',
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    expect(resposta.statusCode).toBe(200)
    const corpo = resposta.json<{ sucesso: boolean; dados: unknown[] }>()
    expect(corpo.sucesso).toBe(true)
    expect(corpo.dados).toHaveLength(2)
  })

  it('deve permitir acesso de RECEPCIONISTA', async () => {
    const resposta = await app.inject({
      method: 'GET',
      url: '/setores',
      headers: { authorization: `Bearer ${tokenRecep}` },
    })

    expect(resposta.statusCode).toBe(200)
  })

  it('deve retornar 401 sem autenticação', async () => {
    const resposta = await app.inject({ method: 'GET', url: '/setores' })
    expect(resposta.statusCode).toBe(401)
  })
})
