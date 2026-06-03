import Fastify, { type FastifyInstance, type FastifyRequest, type FastifyReply } from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import compress from '@fastify/compress'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  hasZodFastifySchemaValidationErrors,
} from 'fastify-type-provider-zod'
import { ErroBase } from '@/compartilhado/erros/erro-base'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'
import '@/infra/http/tipos'

export async function criarAplicacao(): Promise<FastifyInstance> {
  const app = Fastify(
    process.env.NODE_ENV === 'production'
      ? { logger: { level: 'warn' } }
      : {
          logger: {
            level: 'debug',
            transport: {
              target: 'pino-pretty',
              options: { colorize: true, translateTime: 'HH:MM:ss Z' },
            },
          },
        },
  ) as unknown as FastifyInstance

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  await app.register(helmet)
  await app.register(cors, {
    origin: process.env.CORS_ORIGENS?.split(',') ?? ['http://localhost:5173'],
    credentials: true,
  })
  await app.register(compress)
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (_req, context) => ({
      sucesso: false,
      erro: {
        mensagem: `Muitas requisições. Tente novamente em ${context.after}.`,
        codigo: 'LIMITE_REQUISICOES',
      },
    }),
  })

  await app.register(cookie)
  await app.register(jwt, {
    secret: process.env.JWT_SECRETO ?? '',
    sign: { expiresIn: process.env.JWT_EXPIRACAO_ACCESS ?? '1h' },
  })

  if (process.env.NODE_ENV === 'development') {
    await app.register(swagger, {
      openapi: {
        openapi: '3.1.0',
        info: {
          title: 'Bem-vindo API',
          description: 'Sistema de recepção corporativa para controle de entrada de visitantes.',
          version: '1.0.0',
        },
        components: {
          securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          },
        },
      },
      transform: jsonSchemaTransform,
    })
    await app.register(swaggerUi, {
      routePrefix: '/documentacao',
      uiConfig: { docExpansion: 'list' },
    })
  }

  app.setErrorHandler((erro, req, reply) => {
    if (hasZodFastifySchemaValidationErrors(erro)) {
      return reply.status(400).send({
        sucesso: false,
        erro: { mensagem: 'Dados inválidos.', codigo: 'DADOS_INVALIDOS' },
      })
    }

    if (erro instanceof ErroBase) {
      return reply.status(erro.statusHttp).send({
        sucesso: false,
        erro: { mensagem: erro.message, codigo: erro.codigo },
      })
    }

    req.log.error({ err: erro }, 'Erro não tratado')
    return reply.status(500).send({
      sucesso: false,
      erro: { mensagem: 'Erro interno do servidor.', codigo: 'ERRO_INTERNO' },
    })
  })

  app.decorate(
    'autenticar',
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        await request.jwtVerify()
      } catch {
        return reply.status(401).send({
          sucesso: false,
          erro: { mensagem: 'Não autenticado.', codigo: 'NAO_AUTENTICADO' },
        })
      }
    },
  )

  app.decorate(
    'autorizarAdmin',
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      if (request.user.papel !== PapelUsuario.ADMINISTRADOR) {
        return reply.status(403).send({
          sucesso: false,
          erro: { mensagem: 'Sem permissão para realizar esta ação.', codigo: 'SEM_PERMISSAO' },
        })
      }
    },
  )

  app.get('/saude', () => ({
    sucesso: true,
    dados: { status: 'ok', ambiente: process.env.NODE_ENV },
  }))

  return app
}
