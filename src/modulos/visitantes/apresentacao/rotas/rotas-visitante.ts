import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { ControladorVisitante } from '@/modulos/visitantes/apresentacao/controladores/controlador-visitante'
import {
  schemaCadastrarVisitante,
  schemaEditarVisitante,
  schemaListarVisitantesHoje,
  schemaBuscarHistoricoVisitante,
} from '@/modulos/visitantes/apresentacao/schemas/schema-visitante'
import { z } from 'zod'

function autenticar(app: FastifyInstance) {
  return (req: FastifyRequest, reply: FastifyReply) => app.autenticar(req, reply)
}

export function rotasVisitante(
  app: FastifyInstance,
  opcoes: { controlador: ControladorVisitante },
): void {
  const { controlador } = opcoes
  const rotas = app.withTypeProvider<ZodTypeProvider>()

  rotas.post('/', {
    schema: { body: schemaCadastrarVisitante },
    preHandler: [autenticar(app)],
    handler: async (req, reply) => {
      const dados = await controlador.cadastrar(req.body, req.user.usuarioId)
      return reply.status(201).send({ sucesso: true, dados })
    },
  })

  rotas.patch('/:id', {
    schema: {
      params: z.object({ id: z.string().length(24) }),
      body: schemaEditarVisitante,
    },
    preHandler: [autenticar(app)],
    handler: async (req, reply) => {
      const dados = await controlador.editar(req.params.id, req.body, req.user.usuarioId, req.user.papel)
      return reply.status(200).send({ sucesso: true, dados })
    },
  })

  rotas.get('/hoje', {
    schema: { querystring: schemaListarVisitantesHoje },
    preHandler: [autenticar(app)],
    handler: async (req, reply) => {
      const resultado = await controlador.listarHoje(req.query)
      return reply.status(200).send({ sucesso: true, ...resultado })
    },
  })

  rotas.get('/', {
    schema: { querystring: schemaBuscarHistoricoVisitante },
    preHandler: [autenticar(app)],
    handler: async (req, reply) => {
      const resultado = await controlador.buscarHistorico(req.query)
      return reply.status(200).send({ sucesso: true, ...resultado })
    },
  })
}
