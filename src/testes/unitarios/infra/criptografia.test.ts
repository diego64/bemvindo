import { describe, it, expect } from 'vitest'
import { hashSenha, verificarSenha } from '@/compartilhado/utilitarios/criptografia'

describe('hashSenha', () => {
  it('deve gerar hash com formato sal:hash', async () => {
    const hash = await hashSenha('minhaSenha123')

    expect(hash).toContain(':')
    const partes = hash.split(':')
    expect(partes).toHaveLength(2)
    expect(partes[0]).toHaveLength(32) // sal hexadecimal de 16 bytes
    expect(partes[1]).toHaveLength(128) // hash de 64 bytes em hex
  })

  it('deve gerar hashes diferentes para a mesma senha (sal aleatório)', async () => {
    const hash1 = await hashSenha('minhaSenha123')
    const hash2 = await hashSenha('minhaSenha123')

    expect(hash1).not.toBe(hash2)
  })
})

describe('verificarSenha', () => {
  it('deve retornar true para senha correta', async () => {
    const hash = await hashSenha('senhaCorreta')

    const resultado = await verificarSenha('senhaCorreta', hash)

    expect(resultado).toBe(true)
  })

  it('deve retornar false para senha incorreta', async () => {
    const hash = await hashSenha('senhaCorreta')

    const resultado = await verificarSenha('senhaErrada', hash)

    expect(resultado).toBe(false)
  })

  it('deve retornar false quando hash não contém separador ":" — branch !sal', async () => {
    // hash sem ":" → split retorna array com um elemento, sal e hashArmazenado são undefined/falsy
    const resultado = await verificarSenha('qualquer', 'hashsemseperador')

    expect(resultado).toBe(false)
  })

  it('deve retornar false quando hash está vazio', async () => {
    const resultado = await verificarSenha('qualquer', '')

    expect(resultado).toBe(false)
  })

  it('deve retornar false quando hash contém ":" mas parte do sal é vazia — branch !sal', async () => {
    // sal vazio: ":hashParte" → sal = "" (falsy)
    const resultado = await verificarSenha('qualquer', ':hashParte')

    expect(resultado).toBe(false)
  })

  it('deve retornar false quando hash contém ":" mas parte do hash é vazia — branch !hashArmazenado', async () => {
    // hashArmazenado vazio: "sal:" → hashArmazenado = "" (falsy)
    const resultado = await verificarSenha('qualquer', 'sal:')

    expect(resultado).toBe(false)
  })
})
