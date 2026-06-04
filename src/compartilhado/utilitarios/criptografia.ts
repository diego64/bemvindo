import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

export async function hashSenha(senha: string): Promise<string> {
  const sal = randomBytes(16).toString('hex')
  const derivado = (await scryptAsync(senha, sal, 64)) as Buffer
  return `${sal}:${derivado.toString('hex')}`
}

export async function verificarSenha(senha: string, hash: string): Promise<boolean> {
  const [sal, hashArmazenado] = hash.split(':')
  if (!sal || !hashArmazenado) return false
  const derivado = (await scryptAsync(senha, sal, 64)) as Buffer
  const hashArmazenadoBuffer = Buffer.from(hashArmazenado, 'hex')
  if (derivado.length !== hashArmazenadoBuffer.length) return false
  return timingSafeEqual(derivado, hashArmazenadoBuffer)
}
