import Redis from 'ioredis'

let redis: Redis | null = null

export function obterRedis(): Redis {
  if (redis) return redis

  const url = process.env.REDIS_URL
  if (!url) throw new Error('Variável de ambiente REDIS_URL não definida.')

  redis = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy: (tentativas) => Math.min(tentativas * 200, 3_000),
    enableOfflineQueue: false,
  })

  redis.on('error', (err: Error) => {
    process.stderr.write(`[Redis] Erro de conexão: ${err.message}\n`)
  })

  redis.on('reconnecting', () => {
    process.stderr.write('[Redis] Reconectando...\n')
  })

  return redis
}

export async function desconectarRedis(): Promise<void> {
  if (redis) {
    await redis.quit()
    redis = null
  }
}
