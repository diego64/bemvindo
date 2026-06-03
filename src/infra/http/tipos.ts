import type * as Fastify from 'fastify'
import type { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      usuarioId: string
      email: string
      papel: PapelUsuario
    }
    user: {
      usuarioId: string
      email: string
      papel: PapelUsuario
    }
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    autenticar(
      request: Fastify.FastifyRequest,
      reply: Fastify.FastifyReply,
    ): Promise<void>
    autorizarAdmin(
      request: Fastify.FastifyRequest,
      reply: Fastify.FastifyReply,
    ): Promise<void>
  }
}
