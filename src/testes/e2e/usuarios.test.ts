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

beforeAll(async () => {
  process.env.JWT_SECRETO = 'jwt-secreto-de-teste-com-pelo-menos-32-chars'
  process.env.NODE_ENV = 'test'

  bd = await conectarBdTeste()
  app = await criarAplicacao()

  const repositorioUsuario = new RepositorioUsuarioMongo(bd)
  const repositorioContador = new RepositorioContadorMongo(bd)
  await repositorioUsuario.criarIndices()

  const controlador = new ControladorUsuario(
    new CadastrarUsuario(repositorioUsuario, repositorioContador),
    new ListarUsuarios(repositorioUsuario),
    new AtualizarUsuario(repositorioUsuario),
  )

  await app.register(rotasUsuario, { prefix: '/usuarios', controlador })
  await app.ready()
})

afterAll(async () => {
  await limparColecao(bd, 'usuarios')
  await limparColecao(bd, 'contadores')
  await app.close()
  await desconectarBdTeste()
})


beforeEach(async () => {
  await limparColecao(bd, 'usuarios')
  await limparColecao(bd, 'contadores')
  const admin = await criarAdminTeste(bd, app)
  tokenAdmin = admin.token
})

describe('POST /usuarios', () => {
  const payloadValido = {
    nome: 'Carlos',
    sobrenome: 'Oliveira',
    telefone: '11977777777',
    email: 'carlos@empresa.com',
    senha: 'senha12345',
    papel: PapelUsuario.RECEPCIONISTA,
  }

  it('deve retornar 201 com dados do usuário criado (sem senha)', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/usuarios',
      payload: payloadValido,
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    expect(resposta.statusCode).toBe(201)
    const corpo = resposta.json<{ sucesso: boolean; dados: Record<string, unknown> }>()
    expect(corpo.sucesso).toBe(true)
    expect(corpo.dados.email).toBe('carlos@empresa.com')
    expect(corpo.dados.matricula).toMatch(/^RECEP\d{7}$/)
    expect(corpo.dados).not.toHaveProperty('senha')
    expect(corpo.dados).not.toHaveProperty('senhaHash')
  })

  it('deve retornar 401 sem token de autenticação', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/usuarios',
      payload: payloadValido,
    })

    expect(resposta.statusCode).toBe(401)
  })

  it('deve retornar 403 quando autenticado como RECEPCIONISTA', async () => {
    const tokenRecep = app.jwt.sign({
      usuarioId: new ObjectId().toString(),
      email: 'recep@teste.com',
      papel: PapelUsuario.RECEPCIONISTA,
    })

    const resposta = await app.inject({
      method: 'POST',
      url: '/usuarios',
      payload: payloadValido,
      headers: { authorization: `Bearer ${tokenRecep}` },
    })

    expect(resposta.statusCode).toBe(403)
  })

  it('deve retornar 409 quando email já está cadastrado', async () => {
    await app.inject({
      method: 'POST',
      url: '/usuarios',
      payload: payloadValido,
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    const resposta = await app.inject({
      method: 'POST',
      url: '/usuarios',
      payload: payloadValido,
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    expect(resposta.statusCode).toBe(409)
    expect(resposta.json<{ erro: { codigo: string } }>().erro.codigo).toBe('EMAIL_JA_CADASTRADO')
  })

  it('deve retornar 400 quando dados são inválidos (email malformado)', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/usuarios',
      payload: { ...payloadValido, email: 'email-invalido' },
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    expect(resposta.statusCode).toBe(400)
  })

  it('deve retornar 400 quando senha tem menos de 8 caracteres', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/usuarios',
      payload: { ...payloadValido, senha: '123' },
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    expect(resposta.statusCode).toBe(400)
  })
})

describe('GET /usuarios', () => {
  it('deve retornar 200 com lista paginada', async () => {
    const resposta = await app.inject({
      method: 'GET',
      url: '/usuarios',
      headers: { authorization: `Bearer ${tokenAdmin}` },
    })

    expect(resposta.statusCode).toBe(200)
    const corpo = resposta.json<{ sucesso: boolean; usuarios: unknown[]; paginacao: unknown }>()
    expect(corpo.sucesso).toBe(true)
    expect(Array.isArray(corpo.usuarios)).toBe(true)
    expect(corpo.paginacao).toBeDefined()
  })

  it('deve retornar 401 sem autenticação', async () => {
    const resposta = await app.inject({ method: 'GET', url: '/usuarios' })
    expect(resposta.statusCode).toBe(401)
  })
})
