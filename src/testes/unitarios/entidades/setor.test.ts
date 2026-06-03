import { describe, it, expect } from 'vitest'
import { ObjectId } from 'mongodb'
import { Setor } from '@/modulos/setores/dominio/entidades/setor'
import { ErroNomeSetorInvalido } from '@/compartilhado/erros/erro-nome-setor-invalido'

function dadosValidos() {
  const id = new ObjectId()
  return {
    id,
    nome: 'Recursos Humanos',
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    criadoPor: id,
    atualizadoPor: id,
  }
}

describe('Setor', () => {
  describe('construtor', () => {
    it('deve criar setor com dados válidos', () => {
      const setor = new Setor(dadosValidos())
      expect(setor.nome).toBe('Recursos Humanos')
    })

    it('deve fazer trim do nome', () => {
      const setor = new Setor({ ...dadosValidos(), nome: '  TI  ' })
      expect(setor.nome).toBe('TI')
    })

    it('deve lançar ErroNomeSetorInvalido para nome vazio', () => {
      expect(() => new Setor({ ...dadosValidos(), nome: '' })).toThrow(ErroNomeSetorInvalido)
    })

    it('deve lançar ErroNomeSetorInvalido para nome com 1 caractere', () => {
      expect(() => new Setor({ ...dadosValidos(), nome: 'A' })).toThrow(ErroNomeSetorInvalido)
    })

    it('deve lançar ErroNomeSetorInvalido para nome só com espaços', () => {
      expect(() => new Setor({ ...dadosValidos(), nome: '  ' })).toThrow(ErroNomeSetorInvalido)
    })

    it('deve aceitar nome com exatamente 2 caracteres', () => {
      const setor = new Setor({ ...dadosValidos(), nome: 'TI' })
      expect(setor.nome).toBe('TI')
    })
  })

  describe('getters', () => {
    it('deve expor id, criadoEm, atualizadoEm, criadoPor e atualizadoPor', () => {
      const dados = dadosValidos()
      const setor = new Setor(dados)
      expect(setor.id).toEqual(dados.id)
      expect(setor.criadoEm).toEqual(dados.criadoEm)
      expect(setor.atualizadoEm).toEqual(dados.atualizadoEm)
      expect(setor.criadoPor).toEqual(dados.criadoPor)
      expect(setor.atualizadoPor).toEqual(dados.atualizadoPor)
    })
  })
})
