import { createHash } from 'crypto'
import { ObjectId } from 'mongodb'
import type { RepositorioToken } from '@/modulos/autenticacao/dominio/repositorios/repositorio-token'

export class RealizarLogout {
  constructor(private readonly repositorioToken: RepositorioToken) {}

  async executar(cookieRefreshToken: string): Promise<void> {
    const separador = cookieRefreshToken.indexOf(':')
    if (separador === -1) return

    const usuarioId = cookieRefreshToken.substring(0, separador)
    const rawToken = cookieRefreshToken.substring(separador + 1)

    if (!usuarioId || !rawToken || !ObjectId.isValid(usuarioId)) return

    const tokenHash = createHash('sha256').update(rawToken).digest('hex')
    await this.repositorioToken.revogar(usuarioId, tokenHash)
  }
}
