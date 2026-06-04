import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { ControladorUsuario } from '@/modulos/usuarios/apresentacao/controladores/controlador-usuario'
import {
  schemaCadastrarUsuario,
  schemaAtualizarUsuario,
  schemaPaginacao,
} from '@/modulos/usuarios/apresentacao/schemas/schema-usuario'

// Wrappers evitam unbound-method — os decorators Fastify precisam de `app` como receptor
function autenticar(app: FastifyInstance) {
  return (req: FastifyRequest, reply: FastifyReply) => app.autenticar(req, reply)
}
function autorizarAdmin(app: FastifyInstance) {
  return (req: FastifyRequest, reply: FastifyReply) => app.autorizarAdmin(req, reply)
}

export function rotasUsuario(
  app: FastifyInstance,
  opcoes: { controlador: ControladorUsuario },
): void {
  const { controlador } = opcoes
  const rotas = app.withTypeProvider<ZodTypeProvider>()

  rotas.post('/', {
    schema: { body: schemaCadastrarUsuario },
    preHandler: [autenticar(app), autorizarAdmin(app)],
    handler: async (req, reply) => {
      const dados = await controlador.cadastrar(req.body, req.user.usuarioId)
      return reply.status(201).send({ sucesso: true, dados })
    },
  })

  rotas.get('/', {
    schema: { querystring: schemaPaginacao },
    preHandler: [autenticar(app), autorizarAdmin(app)],
    handler: async (req, reply) => {
      const dados = await controlador.listar(req.query)
      return reply.status(200).send({ sucesso: true, ...dados })
    },
  })

  rotas.patch('/:id', {
    schema: {
      params: z.object({ id: z.string().length(24, 'ID deve ter 24 caracteres.') }),
      body: schemaAtualizarUsuario,
    },
    preHandler: [autenticar(app), autorizarAdmin(app)],
    handler: async (req, reply) => {
      const dados = await controlador.atualizar(req.params.id, req.body, req.user.usuarioId)
      return reply.status(200).send({ sucesso: true, dados })
    },
  })
}
