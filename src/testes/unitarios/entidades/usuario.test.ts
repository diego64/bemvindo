import { describe, it, expect } from 'vitest'
import { ObjectId } from 'mongodb'
import { Usuario } from '@/modulos/usuarios/dominio/entidades/usuario'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'

function dadosValidos() {
  const id = new ObjectId()
  return {
    id,
    nome: 'João',
    sobrenome: 'Silva',
    telefone: '11999998888',
    email: 'joao@empresa.com',
    senhaHash: 'hash-qualquer',
    matricula: 'RECEP0000001',
    papel: PapelUsuario.RECEPCIONISTA,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    criadoPor: id,
    atualizadoPor: id,
  }
}

describe('Usuario', () => {
  describe('construtor', () => {
    it('deve criar usuário com dados válidos', () => {
      const usuario = new Usuario(dadosValidos())
      expect(usuario.nome).toBe('João')
      expect(usuario.sobrenome).toBe('Silva')
    })

    it('deve normalizar email para lowercase', () => {
      const usuario = new Usuario({ ...dadosValidos(), email: 'JOAO@EMPRESA.COM' })
      expect(usuario.email).toBe('joao@empresa.com')
    })

    it('deve fazer trim do nome', () => {
      const usuario = new Usuario({ ...dadosValidos(), nome: '  João  ' })
      expect(usuario.nome).toBe('João')
    })

    it('deve lançar erro para nome com 1 caractere', () => {
      expect(() => new Usuario({ ...dadosValidos(), nome: 'J' })).toThrow('Nome deve ter no mínimo 2 caracteres')
    })

    it('deve lançar erro para nome vazio', () => {
      expect(() => new Usuario({ ...dadosValidos(), nome: '' })).toThrow('Nome deve ter no mínimo 2 caracteres')
    })

    it('deve lançar erro para sobrenome com 1 caractere', () => {
      expect(() => new Usuario({ ...dadosValidos(), sobrenome: 'S' })).toThrow('Sobrenome deve ter no mínimo 2 caracteres')
    })

    it('deve lançar erro para sobrenome vazio', () => {
      expect(() => new Usuario({ ...dadosValidos(), sobrenome: '' })).toThrow('Sobrenome deve ter no mínimo 2 caracteres')
    })

    it('deve expor matricula, papel e senhaHash corretamente', () => {
      const usuario = new Usuario(dadosValidos())
      expect(usuario.matricula).toBe('RECEP0000001')
      expect(usuario.papel).toBe(PapelUsuario.RECEPCIONISTA)
      expect(usuario.senhaHash).toBe('hash-qualquer')
    })
  })

  describe('atualizar()', () => {
    it('deve atualizar nome com sucesso', () => {
      const usuario = new Usuario(dadosValidos())
      const atualizadoPor = new ObjectId()
      usuario.atualizar({ nome: 'Carlos' }, atualizadoPor)
      expect(usuario.nome).toBe('Carlos')
    })

    it('deve atualizar sobrenome com sucesso', () => {
      const usuario = new Usuario(dadosValidos())
      usuario.atualizar({ sobrenome: 'Oliveira' }, new ObjectId())
      expect(usuario.sobrenome).toBe('Oliveira')
    })

    it('deve atualizar telefone com sucesso', () => {
      const usuario = new Usuario(dadosValidos())
      usuario.atualizar({ telefone: '11888887777' }, new ObjectId())
      expect(usuario.telefone).toBe('11888887777')
    })

    it('deve atualizar atualizadoEm ao chamar atualizar()', () => {
      const usuario = new Usuario(dadosValidos())
      const antes = usuario.atualizadoEm
      usuario.atualizar({ nome: 'Novo' }, new ObjectId())
      expect(usuario.atualizadoEm.getTime()).toBeGreaterThanOrEqual(antes.getTime())
    })

    it('deve atualizar atualizadoPor ao chamar atualizar()', () => {
      const usuario = new Usuario(dadosValidos())
      const novoResponsavel = new ObjectId()
      usuario.atualizar({ nome: 'Novo' }, novoResponsavel)
      expect(usuario.atualizadoPor).toEqual(novoResponsavel)
    })

    it('deve lançar erro para nome muito curto em atualizar()', () => {
      const usuario = new Usuario(dadosValidos())
      expect(() => { usuario.atualizar({ nome: 'J' }, new ObjectId()) }).toThrow('Nome deve ter no mínimo 2 caracteres')
    })

    it('deve lançar erro para sobrenome muito curto em atualizar()', () => {
      const usuario = new Usuario(dadosValidos())
      expect(() => { usuario.atualizar({ sobrenome: 'S' }, new ObjectId()) }).toThrow('Sobrenome deve ter no mínimo 2 caracteres')
    })

    it('deve manter campos não informados inalterados', () => {
      const usuario = new Usuario(dadosValidos())
      const nomeOriginal = usuario.nome
      usuario.atualizar({ sobrenome: 'Novo' }, new ObjectId())
      expect(usuario.nome).toBe(nomeOriginal)
    })
  })

  describe('senhaHash setter', () => {
    it('deve permitir alterar o hash da senha', () => {
      const usuario = new Usuario(dadosValidos())
      usuario.senhaHash = 'novo-hash'
      expect(usuario.senhaHash).toBe('novo-hash')
    })
  })
})
