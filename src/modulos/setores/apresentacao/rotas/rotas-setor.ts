import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { ControladorSetor } from '@/modulos/setores/apresentacao/controladores/controlador-setor'
import { schemaCadastrarSetor } from '@/modulos/setores/apresentacao/schemas/schema-setor'

function autenticar(app: FastifyInstance) {
  return (req: FastifyRequest, reply: FastifyReply) => app.autenticar(req, reply)
}
function autorizarAdmin(app: FastifyInstance) {
  return (req: FastifyRequest, reply: FastifyReply) => app.autorizarAdmin(req, reply)
}

export function rotasSetor(
  app: FastifyInstance,
  opcoes: { controlador: ControladorSetor },
): void {
  const { controlador } = opcoes
  const rotas = app.withTypeProvider<ZodTypeProvider>()

  rotas.post('/', {
    schema: { body: schemaCadastrarSetor },
    preHandler: [autenticar(app), autorizarAdmin(app)],
    handler: async (req, reply) => {
      const dados = await controlador.cadastrar(req.body, req.user.usuarioId)
      return reply.status(201).send({ sucesso: true, dados })
    },
  })

  rotas.get('/', {
    preHandler: [autenticar(app)],
    handler: async (_req, reply) => {
      const dados = await controlador.listar()
      return reply.status(200).send({ sucesso: true, dados })
    },
  })
}
