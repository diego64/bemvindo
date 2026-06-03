import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { randomBytes, createHash } from 'crypto'
import type { FastifyInstance } from 'fastify'
import type { Db } from 'mongodb'
import { criarAplicacao } from '@/infra/http/aplicacao'
import { RepositorioUsuarioMongo } from '@/modulos/usuarios/infra/repositorios/repositorio-usuario-mongo'
import { RepositorioContadorMongo } from '@/infra/bd/repositorio-contador-mongo'
import { RepositorioTokenRedis } from '@/modulos/autenticacao/infra/repositorios/repositorio-token-redis'
import { CadastrarUsuario } from '@/modulos/usuarios/aplicacao/casos-de-uso/cadastrar-usuario'
import { ListarUsuarios } from '@/modulos/usuarios/aplicacao/casos-de-uso/listar-usuarios'
import { AtualizarUsuario } from '@/modulos/usuarios/aplicacao/casos-de-uso/atualizar-usuario'
import { ControladorUsuario } from '@/modulos/usuarios/apresentacao/controladores/controlador-usuario'
import { rotasUsuario } from '@/modulos/usuarios/apresentacao/rotas/rotas-usuario'
import { RealizarLogin } from '@/modulos/autenticacao/aplicacao/casos-de-uso/realizar-login'
import { RenovarToken } from '@/modulos/autenticacao/aplicacao/casos-de-uso/renovar-token'
import { RealizarLogout } from '@/modulos/autenticacao/aplicacao/casos-de-uso/realizar-logout'
import { AlterarSenha } from '@/modulos/autenticacao/aplicacao/casos-de-uso/alterar-senha'
import { BuscarPerfil } from '@/modulos/autenticacao/aplicacao/casos-de-uso/buscar-perfil'
import { ControladorAutenticacao } from '@/modulos/autenticacao/apresentacao/controladores/controlador-autenticacao'
import { rotasAutenticacao } from '@/modulos/autenticacao/apresentacao/rotas/rotas-autenticacao'
import type { ServicoToken } from '@/modulos/autenticacao/dominio/servicos/servico-token'
import {
  conectarBdTeste,
  desconectarBdTeste,
  limparColecao,
  criarAdminTeste,
} from '@/testes/auxiliares/auxiliar-bd'
import { obterRedis, desconectarRedis } from '@/infra/cache/conexao-redis'

let app: FastifyInstance
let bd: Db

beforeAll(async () => {
  process.env.JWT_SECRETO = 'jwt-secreto-de-teste-com-pelo-menos-32-chars'
  process.env.JWT_EXPIRACAO_ACCESS = '1h'
  process.env.NODE_ENV = 'test'
  // Fallback para execução fora do Docker (localhost em vez de bv-redis)
  process.env.REDIS_URL ??= 'redis://administrador:1qaz2sx12@localhost:6379'

  bd = await conectarBdTeste()
  const redis = obterRedis()
  app = await criarAplicacao()

  const repositorioUsuario = new RepositorioUsuarioMongo(bd)
  const repositorioContador = new RepositorioContadorMongo(bd)
  const repositorioToken = new RepositorioTokenRedis(redis)

  await repositorioUsuario.criarIndices()

  const serviçoToken: ServicoToken = {
    gerarAccessToken: (payload) => app.jwt.sign(payload),
    gerarRefreshToken: () => {
      const rawToken = randomBytes(32).toString('hex')
      const tokenHash = createHash('sha256').update(rawToken).digest('hex')
      return { rawToken, tokenHash }
    },
  }

  await app.register(rotasUsuario, {
    prefix: '/usuarios',
    controlador: new ControladorUsuario(
      new CadastrarUsuario(repositorioUsuario, repositorioContador),
      new ListarUsuarios(repositorioUsuario),
      new AtualizarUsuario(repositorioUsuario),
    ),
  })

  await app.register(rotasAutenticacao, {
    prefix: '/autenticacao',
    controlador: new ControladorAutenticacao(
      new RealizarLogin(repositorioUsuario, serviçoToken, repositorioToken),
      new RenovarToken(repositorioUsuario, serviçoToken, repositorioToken),
      new RealizarLogout(repositorioToken),
      new AlterarSenha(repositorioUsuario),
      new BuscarPerfil(repositorioUsuario),
    ),
  })

  await app.ready()
})

afterAll(async () => {
  await limparColecao(bd, 'usuarios')
  await limparColecao(bd, 'contadores')
  await app.close()
  await desconectarBdTeste()
  await desconectarRedis()
})

beforeEach(async () => {
  await limparColecao(bd, 'usuarios')
  await limparColecao(bd, 'contadores')
})

describe('POST /autenticacao/login', () => {
  it('deve retornar 200 com accessToken e setar cookie httpOnly', async () => {
    await criarAdminTeste(bd, app)

    const resposta = await app.inject({
      method: 'POST',
      url: '/autenticacao/login',
      payload: { email: 'admin@teste.com', senha: 'Admin@12345' },
    })

    expect(resposta.statusCode).toBe(200)
    const corpo = resposta.json<{ sucesso: boolean; dados: { accessToken: string } }>()
    expect(corpo.sucesso).toBe(true)
    expect(corpo.dados.accessToken).toBeTruthy()

    const cookies = resposta.cookies
    const refreshCookie = cookies.find((c) => c.name === 'refreshToken')
    expect(refreshCookie).toBeDefined()
    expect(refreshCookie?.httpOnly).toBe(true)
  })

  it('deve retornar 401 para credenciais inválidas', async () => {
    await criarAdminTeste(bd, app)

    const resposta = await app.inject({
      method: 'POST',
      url: '/autenticacao/login',
      payload: { email: 'admin@teste.com', senha: 'senha-errada' },
    })

    expect(resposta.statusCode).toBe(401)
    expect(resposta.json<{ erro: { codigo: string } }>().erro.codigo).toBe('CREDENCIAIS_INVALIDAS')
  })

  it('deve retornar 401 para email inexistente (mesmo código que senha errada)', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/autenticacao/login',
      payload: { email: 'nao@existe.com', senha: 'qualquer' },
    })

    expect(resposta.statusCode).toBe(401)
    expect(resposta.json<{ erro: { codigo: string } }>().erro.codigo).toBe('CREDENCIAIS_INVALIDAS')
  })

  it('deve retornar 400 para dados inválidos', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/autenticacao/login',
      payload: { email: 'email-invalido', senha: 'senha12345' },
    })

    expect(resposta.statusCode).toBe(400)
  })
})

describe('GET /autenticacao/perfil', () => {
  it('deve retornar 200 com dados do usuário autenticado', async () => {
    const { token } = await criarAdminTeste(bd, app)

    const resposta = await app.inject({
      method: 'GET',
      url: '/autenticacao/perfil',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(resposta.statusCode).toBe(200)
    const corpo = resposta.json<{ dados: { email: string } }>()
    expect(corpo.dados.email).toBe('admin@teste.com')
  })

  it('deve retornar 401 sem token', async () => {
    const resposta = await app.inject({ method: 'GET', url: '/autenticacao/perfil' })
    expect(resposta.statusCode).toBe(401)
  })
})

describe('POST /autenticacao/refresh-token → /logout', () => {
  it('deve renovar o token e retornar novo accessToken', async () => {
    await criarAdminTeste(bd, app)

    const login = await app.inject({
      method: 'POST',
      url: '/autenticacao/login',
      payload: { email: 'admin@teste.com', senha: 'Admin@12345' },
    })

    const cookieRefresh = login.cookies.find((c) => c.name === 'refreshToken')
    expect(cookieRefresh).toBeDefined()
    const valorCookie = cookieRefresh?.value ?? ''

    const refresh = await app.inject({
      method: 'POST',
      url: '/autenticacao/refresh-token',
      cookies: { refreshToken: valorCookie },
    })

    expect(refresh.statusCode).toBe(200)
    expect(refresh.json<{ dados: { accessToken: string } }>().dados.accessToken).toBeTruthy()
  })

  it('deve retornar 401 para refresh-token sem cookie', async () => {
    const resposta = await app.inject({ method: 'POST', url: '/autenticacao/refresh-token' })
    expect(resposta.statusCode).toBe(401)
  })

  it('deve realizar logout e revogar o refresh token', async () => {
    await criarAdminTeste(bd, app)

    const login = await app.inject({
      method: 'POST',
      url: '/autenticacao/login',
      payload: { email: 'admin@teste.com', senha: 'Admin@12345' },
    })

    const cookieRefresh = login.cookies.find((c) => c.name === 'refreshToken')
    const valorCookieLogout = cookieRefresh?.value ?? ''

    await app.inject({
      method: 'POST',
      url: '/autenticacao/logout',
      cookies: { refreshToken: valorCookieLogout },
    })

    // Após logout, o refresh token deve ser inválido
    const refresh = await app.inject({
      method: 'POST',
      url: '/autenticacao/refresh-token',
      cookies: { refreshToken: valorCookieLogout },
    })

    expect(refresh.statusCode).toBe(401)
  })
})
