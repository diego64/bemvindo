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

const schemaEnv = z.object({
  PORTA: z.coerce.number().int().min(1).max(65535).default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRETO: z.string().min(32, 'JWT_SECRETO deve ter no mínimo 32 caracteres.'),
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

  obterRedis()
  app.log.info('Redis conectado.')

  // Repositórios
  const repositorioUsuario = new RepositorioUsuarioMongo(bd)
  const repositorioContador = new RepositorioContadorMongo(bd)

  // Índices
  await repositorioUsuario.criarIndices()

  // Casos de uso
  const cadastrarUsuario = new CadastrarUsuario(repositorioUsuario, repositorioContador)
  const listarUsuarios = new ListarUsuarios(repositorioUsuario)
  const atualizarUsuario = new AtualizarUsuario(repositorioUsuario)

  // Controladores
  const controladorUsuario = new ControladorUsuario(cadastrarUsuario, listarUsuarios, atualizarUsuario)

  // Rotas
  await app.register(rotasUsuario, { prefix: '/usuarios', controlador: controladorUsuario })

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
