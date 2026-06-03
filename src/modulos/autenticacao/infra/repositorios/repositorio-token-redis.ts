import type { Redis } from 'ioredis'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'
import type {
  RepositorioToken,
  DadosToken,
} from '@/modulos/autenticacao/dominio/repositorios/repositorio-token'

const PREFIXO = 'refresh_token'
const TTL_SEGUNDOS = 7 * 24 * 60 * 60

function chave(usuarioId: string, tokenHash: string): string {
  return `${PREFIXO}:${usuarioId}:${tokenHash}`
}

function parsearDadosToken(json: string): DadosToken | null {
  try {
    const valor = JSON.parse(json) as unknown
    if (
      typeof valor !== 'object' ||
      !valor ||
      typeof (valor as Record<string, unknown>).usuarioId !== 'string' ||
      typeof (valor as Record<string, unknown>).email !== 'string' ||
      typeof (valor as Record<string, unknown>).papel !== 'string' ||
      typeof (valor as Record<string, unknown>).iat !== 'number' ||
      !Object.values(PapelUsuario).includes((valor as Record<string, unknown>).papel as PapelUsuario)
    )
      return null
    return valor as DadosToken
  } catch {
    return null
  }
}

export class RepositorioTokenRedis implements RepositorioToken {
  constructor(private readonly redis: Redis) {}

  async armazenar(usuarioId: string, tokenHash: string, dados: DadosToken): Promise<void> {
    await this.redis.set(chave(usuarioId, tokenHash), JSON.stringify(dados), 'EX', TTL_SEGUNDOS)
  }

  async buscar(usuarioId: string, tokenHash: string): Promise<DadosToken | null> {
    const valor = await this.redis.get(chave(usuarioId, tokenHash))
    if (!valor) return null
    return parsearDadosToken(valor)
  }

  async revogar(usuarioId: string, tokenHash: string): Promise<void> {
    await this.redis.del(chave(usuarioId, tokenHash))
  }
}
