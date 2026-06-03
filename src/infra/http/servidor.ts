import { randomBytes, createHash } from 'crypto'
import { z } from 'zod'
import { criarAplicacao } from '@/infra/http/aplicacao'
import { conectarMongoDB, desconectarMongoDB } from '@/infra/bd/conexao-mongodb'
import { obterRedis, desconectarRedis } from '@/infra/cache/conexao-redis'
import { RepositorioUsuarioMongo } from '@/modulos/usuarios/infra/repositorios/repositorio-usuario-mongo'
import { RepositorioContadorMongo } from '@/infra/bd/repositorio-contador-mongo'
import { CadastrarUsuario } from '@/modulos/usuarios/aplicacao/casos-de-uso/cadastrar-usuario'
import { ListarUsuarios } from '@/modulos/usuarios/aplicacao/casos-de-uso/listar-usuarios'
import { AtualizarUsuario } from '@/modulos/usuarios/aplicacao/casos-de-uso/atualizar-usuario'
import { ControladorUsuario } from '@/modulos/usuarios/apresentacao/controladores/controlador-usuario'
import { rotasUsuario } from '@/modulos/usuarios/apresentacao/rotas/rotas-usuario'
import { RepositorioTokenRedis } from '@/modulos/autenticacao/infra/repositorios/repositorio-token-redis'
import { RealizarLogin } from '@/modulos/autenticacao/aplicacao/casos-de-uso/realizar-login'
import { RenovarToken } from '@/modulos/autenticacao/aplicacao/casos-de-uso/renovar-token'
import { RealizarLogout } from '@/modulos/autenticacao/aplicacao/casos-de-uso/realizar-logout'
import { AlterarSenha } from '@/modulos/autenticacao/aplicacao/casos-de-uso/alterar-senha'
import { BuscarPerfil } from '@/modulos/autenticacao/aplicacao/casos-de-uso/buscar-perfil'
import { ControladorAutenticacao } from '@/modulos/autenticacao/apresentacao/controladores/controlador-autenticacao'
import { rotasAutenticacao } from '@/modulos/autenticacao/apresentacao/rotas/rotas-autenticacao'
import type { ServicoToken } from '@/modulos/autenticacao/dominio/servicos/servico-token'

const schemaEnv = z.object({
  PORTA: z.coerce.number().int().min(1).max(65535).default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRETO: z.string().min(32, 'JWT_SECRETO deve ter no mínimo 32 caracteres.'),
  JWT_EXPIRACAO_ACCESS: z.string().default('1h'),
  MONGO_URI: z.string().min(1, 'MONGO_URI não definido.'),
  REDIS_URL: z.string().min(1, 'REDIS_URL não definido.'),
})

async function iniciar(): Promise<void> {
  const resultado = schemaEnv.safeParse(process.env)
  if (!resultado.success) {
    process.stderr.write(`Configuração inválida:\n${resultado.error.message}\n`)
    process.exit(1)
  }

  const env = resultado.data

  const app = await criarAplicacao()
  const bd = await conectarMongoDB()
  app.log.info('MongoDB conectado.')

  const redis = obterRedis()
  app.log.info('Redis conectado.')

  // ── Repositórios compartilhados ───────────────────────────────────────────
  const repositorioUsuario = new RepositorioUsuarioMongo(bd)
  const repositorioContador = new RepositorioContadorMongo(bd)
  const repositorioToken = new RepositorioTokenRedis(redis)

  await repositorioUsuario.criarIndices()

  // ── Serviço de token (factory — evita dependência do Fastify no domínio) ──
  const serviçoToken: ServicoToken = {
    gerarAccessToken: (payload) =>
      app.jwt.sign(payload, { expiresIn: env.JWT_EXPIRACAO_ACCESS }),
    gerarRefreshToken: () => {
      const rawToken = randomBytes(32).toString('hex')
      const tokenHash = createHash('sha256').update(rawToken).digest('hex')
      return { rawToken, tokenHash }
    },
  }

  // ── Módulo: usuários ──────────────────────────────────────────────────────
  const controladorUsuario = new ControladorUsuario(
    new CadastrarUsuario(repositorioUsuario, repositorioContador),
    new ListarUsuarios(repositorioUsuario),
    new AtualizarUsuario(repositorioUsuario),
  )
  await app.register(rotasUsuario, { prefix: '/usuarios', controlador: controladorUsuario })

  // ── Módulo: autenticação ──────────────────────────────────────────────────
  const controladorAutenticacao = new ControladorAutenticacao(
    new RealizarLogin(repositorioUsuario, serviçoToken, repositorioToken),
    new RenovarToken(repositorioUsuario, serviçoToken, repositorioToken),
    new RealizarLogout(repositorioToken),
    new AlterarSenha(repositorioUsuario),
    new BuscarPerfil(repositorioUsuario),
  )
  await app.register(rotasAutenticacao, {
    prefix: '/autenticacao',
    controlador: controladorAutenticacao,
  })

  const encerrar = async (sinal: string): Promise<void> => {
    app.log.info(`Sinal ${sinal} recebido. Encerrando...`)
    await app.close()
    await desconectarMongoDB()
    await desconectarRedis()
    process.exit(0)
  }

  process.on('SIGTERM', () => void encerrar('SIGTERM'))
  process.on('SIGINT', () => void encerrar('SIGINT'))

  await app.listen({ port: env.PORTA, host: '0.0.0.0' })
}

iniciar().catch((err: unknown) => {
  process.stderr.write(`Falha ao iniciar o servidor: ${String(err)}\n`)
  process.exit(1)
})
