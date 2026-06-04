import { describe, it, expect } from 'vitest'
import {
  schemaCadastrarUsuario,
  schemaAtualizarUsuario,
  schemaPaginacao,
} from '@/modulos/usuarios/apresentacao/schemas/schema-usuario'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'

describe('schemaCadastrarUsuario', () => {
  it('deve aceitar payload válido com papel RECEPCIONISTA', () => {
    const resultado = schemaCadastrarUsuario.safeParse({
      nome: 'João',
      sobrenome: 'Silva',
      telefone: '11999999999',
      email: 'joao@empresa.com',
      senha: 'Senha@123',
      papel: PapelUsuario.RECEPCIONISTA,
    })

    expect(resultado.success).toBe(true)
  })

  it('deve aceitar payload válido com papel ADMINISTRADOR', () => {
    const resultado = schemaCadastrarUsuario.safeParse({
      nome: 'Admin',
      sobrenome: 'Teste',
      telefone: '11999999999',
      email: 'admin@empresa.com',
      senha: 'Senha@123',
      papel: PapelUsuario.ADMINISTRADOR,
    })

    expect(resultado.success).toBe(true)
  })

  it('deve usar papel RECEPCIONISTA como padrão quando papel não é informado', () => {
    const resultado = schemaCadastrarUsuario.safeParse({
      nome: 'João',
      sobrenome: 'Silva',
      telefone: '11999999999',
      email: 'joao@empresa.com',
      senha: 'Senha@123',
    })

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.papel).toBe(PapelUsuario.RECEPCIONISTA)
    }
  })

  it('deve rejeitar nome com menos de 2 caracteres', () => {
    const resultado = schemaCadastrarUsuario.safeParse({
      nome: 'J',
      sobrenome: 'Silva',
      telefone: '11999999999',
      email: 'joao@empresa.com',
      senha: 'Senha@123',
    })

    expect(resultado.success).toBe(false)
  })

  it('deve rejeitar email inválido', () => {
    const resultado = schemaCadastrarUsuario.safeParse({
      nome: 'João',
      sobrenome: 'Silva',
      telefone: '11999999999',
      email: 'email-invalido',
      senha: 'Senha@123',
    })

    expect(resultado.success).toBe(false)
  })

  it('deve rejeitar senha com menos de 8 caracteres', () => {
    const resultado = schemaCadastrarUsuario.safeParse({
      nome: 'João',
      sobrenome: 'Silva',
      telefone: '11999999999',
      email: 'joao@empresa.com',
      senha: '1234567',
    })

    expect(resultado.success).toBe(false)
  })
})

describe('schemaAtualizarUsuario', () => {
  it('deve aceitar payload com apenas nome', () => {
    const resultado = schemaAtualizarUsuario.safeParse({ nome: 'Carlos' })

    expect(resultado.success).toBe(true)
  })

  it('deve aceitar payload com apenas sobrenome', () => {
    const resultado = schemaAtualizarUsuario.safeParse({ sobrenome: 'Oliveira' })

    expect(resultado.success).toBe(true)
  })

  it('deve aceitar payload com apenas telefone', () => {
    const resultado = schemaAtualizarUsuario.safeParse({ telefone: '11888887777' })

    expect(resultado.success).toBe(true)
  })

  it('deve aceitar payload com todos os campos', () => {
    const resultado = schemaAtualizarUsuario.safeParse({
      nome: 'Carlos',
      sobrenome: 'Ferreira',
      telefone: '11888887777',
    })

    expect(resultado.success).toBe(true)
  })

  it('deve rejeitar payload vazio (nenhum campo informado) — branch do refine', () => {
    const resultado = schemaAtualizarUsuario.safeParse({})

    expect(resultado.success).toBe(false)
    if (!resultado.success) {
      expect(resultado.error.issues[0]?.message).toBe('Informe ao menos um campo para atualizar.')
    }
  })

  it('deve rejeitar nome com menos de 2 caracteres', () => {
    const resultado = schemaAtualizarUsuario.safeParse({ nome: 'J' })

    expect(resultado.success).toBe(false)
  })
})

describe('schemaPaginacao', () => {
  it('deve aceitar pagina e itensPorPagina válidos', () => {
    const resultado = schemaPaginacao.safeParse({ pagina: '2', itensPorPagina: '10' })

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.pagina).toBe(2)
      expect(resultado.data.itensPorPagina).toBe(10)
    }
  })

  it('deve usar valores padrão quando não informados', () => {
    const resultado = schemaPaginacao.safeParse({})

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.pagina).toBe(1)
      expect(resultado.data.itensPorPagina).toBe(20)
    }
  })

  it('deve rejeitar pagina menor que 1', () => {
    const resultado = schemaPaginacao.safeParse({ pagina: 0 })

    expect(resultado.success).toBe(false)
  })

  it('deve rejeitar itensPorPagina maior que 100', () => {
    const resultado = schemaPaginacao.safeParse({ itensPorPagina: 101 })

    expect(resultado.success).toBe(false)
  })
})
