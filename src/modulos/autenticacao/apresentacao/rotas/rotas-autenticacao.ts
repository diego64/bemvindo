import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { ControladorAutenticacao } from '@/modulos/autenticacao/apresentacao/controladores/controlador-autenticacao'
import {
  schemaRealizarLogin,
  schemaAlterarSenha,
} from '@/modulos/autenticacao/apresentacao/schemas/schema-autenticacao'

const NOME_COOKIE = 'refreshToken'
const MAX_AGE_COOKIE = 7 * 24 * 60 * 60

function autenticar(app: FastifyInstance) {
  return (req: FastifyRequest, reply: FastifyReply) => app.autenticar(req, reply)
}

export function rotasAutenticacao(
  app: FastifyInstance,
  opcoes: { controlador: ControladorAutenticacao },
): void {
  const { controlador } = opcoes
  const rotas = app.withTypeProvider<ZodTypeProvider>()

  rotas.post('/login', {
    config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
    schema: { body: schemaRealizarLogin },
    handler: async (req, reply) => {
      const resultado = await controlador.login(req.body)
      void reply.setCookie(NOME_COOKIE, resultado.refreshTokenCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: MAX_AGE_COOKIE,
      })
      return reply.status(200).send({
        sucesso: true,
        dados: {
          accessToken: resultado.accessToken,
          usuario: resultado.usuario,
        },
      })
    },
  })

  rotas.post('/refresh-token', {
    config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
    handler: async (req, reply) => {
      const cookieRefreshToken = req.cookies[NOME_COOKIE]
      if (!cookieRefreshToken) {
        return reply.status(401).send({
          sucesso: false,
          erro: { mensagem: 'Token inválido ou expirado.', codigo: 'TOKEN_INVALIDO' },
        })
      }
      const resultado = await controlador.refresh(cookieRefreshToken)
      return reply.status(200).send({ sucesso: true, dados: resultado })
    },
  })

  rotas.post('/logout', {
    handler: async (req, reply) => {
      const cookieRefreshToken = req.cookies[NOME_COOKIE]
      if (cookieRefreshToken) {
        await controlador.logout(cookieRefreshToken)
      }
      void reply.clearCookie(NOME_COOKIE, { path: '/' })
      return reply.status(200).send({ sucesso: true, dados: { mensagem: 'Logout realizado.' } })
    },
  })

  rotas.get('/perfil', {
    preHandler: [autenticar(app)],
    handler: async (req, reply) => {
      const dados = await controlador.perfil(req.user.usuarioId)
      return reply.status(200).send({ sucesso: true, dados })
    },
  })

  rotas.patch('/alterar-senha', {
    schema: { body: schemaAlterarSenha },
    preHandler: [autenticar(app)],
    handler: async (req, reply) => {
      await controlador.alterarMinhaSenha(req.user.usuarioId, req.body)
      return reply.status(200).send({
        sucesso: true,
        dados: { mensagem: 'Senha alterada com sucesso.' },
      })
    },
  })
}
