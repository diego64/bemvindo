import { z } from 'zod'
import { criarAplicacao } from '@/infra/http/aplicacao'
import { conectarMongoDB, desconectarMongoDB } from '@/infra/bd/conexao-mongodb'
import { obterRedis, desconectarRedis } from '@/infra/cache/conexao-redis'

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

  await conectarMongoDB()
  app.log.info('MongoDB conectado.')

  obterRedis()
  app.log.info('Redis conectado.')

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
