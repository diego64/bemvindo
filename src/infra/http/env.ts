import { z } from 'zod'

export const schemaEnv = z.object({
  PORTA: z.coerce.number().int().min(1).max(65535).default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRETO: z.string().min(32, 'JWT_SECRETO deve ter no mínimo 32 caracteres.'),
  JWT_EXPIRACAO_ACCESS: z.string().default('1h'),
  MONGO_URI: z.string().min(1, 'MONGO_URI não definido.'),
  REDIS_URL: z.string().min(1, 'REDIS_URL não definido.'),
})

export type Env = z.infer<typeof schemaEnv>

/**
 * Resolve a porta a partir de PORT (Render/cloud) ou PORTA (local/Docker).
 * PORT tem precedência para compatibilidade com plataformas cloud.
 */
export function resolverEnv(vars: NodeJS.ProcessEnv): ReturnType<typeof schemaEnv.safeParse> {
  return schemaEnv.safeParse({
    ...vars,
    PORTA: vars.PORT ?? vars.PORTA,
  })
}
