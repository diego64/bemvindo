import { describe, it, expect } from 'vitest'
import { ObjectId } from 'mongodb'
import { Visitante } from '@/modulos/visitantes/dominio/entidades/visitante'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'
import { ErroVisitanteNaoPodeSerEditado } from '@/compartilhado/erros/erro-visitante-nao-pode-ser-editado'

function dadosValidos(criadoEm = new Date()) {
  const id = new ObjectId()
  const recepId = new ObjectId()
  return {
    id,
    codigoVisitante: 'VIST0000001',
    cpf: '52998224725',
    nomeCompleto: 'João da Silva',
    dataNascimento: new Date('1990-06-15'),
    telefone: '11999998888',
    email: 'joao@email.com',
    setorDestinoId: new ObjectId(),
    recepcionistaId: recepId,
    recepcionistaNome: 'Recepcionista Teste',
    recepcionistaMatricula: 'RECEP0000001',
    criadoEm,
    atualizadoEm: criadoEm,
    criadoPor: recepId,
    atualizadoPor: recepId,
  }
}

describe('Visitante', () => {
  describe('construtor', () => {
    it('deve criar visitante com dados válidos', () => {
      const visitante = new Visitante(dadosValidos())
      expect(visitante.nomeCompleto).toBe('João da Silva')
      expect(visitante.cpf).toBe('52998224725')
      expect(visitante.codigoVisitante).toBe('VIST0000001')
    })

    it('deve normalizar email para lowercase', () => {
      const visitante = new Visitante({ ...dadosValidos(), email: 'JOAO@EMAIL.COM' })
      expect(visitante.email).toBe('joao@email.com')
    })

    it('deve fazer trim do nome', () => {
      const visitante = new Visitante({ ...dadosValidos(), nomeCompleto: '  João Silva  ' })
      expect(visitante.nomeCompleto).toBe('João Silva')
    })

    it('deve lançar erro para nome com menos de 3 caracteres', () => {
      expect(() => new Visitante({ ...dadosValidos(), nomeCompleto: 'Jo' })).toThrow()
    })

    it('deve lançar erro para nome vazio', () => {
      expect(() => new Visitante({ ...dadosValidos(), nomeCompleto: '' })).toThrow()
    })

    it('deve lançar ErroCpfInvalido para CPF inválido', () => {
      expect(() => new Visitante({ ...dadosValidos(), cpf: '11111111111' })).toThrow()
    })
  })

  describe('atualizar()', () => {
    it('deve permitir admin editar visitante criado há mais de 30 minutos', () => {
      const criadoHaMuito = new Date(Date.now() - 60 * 60 * 1000)
      const visitante = new Visitante(dadosValidos(criadoHaMuito))

      expect(() => {
        visitante.atualizar({ nomeCompleto: 'Novo Nome' }, PapelUsuario.ADMINISTRADOR, new ObjectId())
      }).not.toThrow()

      expect(visitante.nomeCompleto).toBe('Novo Nome')
    })

    it('deve permitir recepcionista editar visitante criado há menos de 30 minutos', () => {
      const recente = new Date()
      const visitante = new Visitante(dadosValidos(recente))

      expect(() => {
        visitante.atualizar({ nomeCompleto: 'Novo Nome' }, PapelUsuario.RECEPCIONISTA, new ObjectId())
      }).not.toThrow()
    })

    it('deve lançar ErroVisitanteNaoPodeSerEditado para recepcionista após 30 minutos', () => {
      const criadoHaMuito = new Date(Date.now() - 31 * 60 * 1000)
      const visitante = new Visitante(dadosValidos(criadoHaMuito))

      expect(() => {
        visitante.atualizar({ nomeCompleto: 'Tentativa' }, PapelUsuario.RECEPCIONISTA, new ObjectId())
      }).toThrow(ErroVisitanteNaoPodeSerEditado)
    })

    it('deve atualizar telefone e email', () => {
      const visitante = new Visitante(dadosValidos())
      visitante.atualizar({ telefone: '11777776666', email: 'novo@email.com' }, PapelUsuario.ADMINISTRADOR, new ObjectId())
      expect(visitante.telefone).toBe('11777776666')
      expect(visitante.email).toBe('novo@email.com')
    })

    it('deve normalizar email para lowercase em atualizar()', () => {
      const visitante = new Visitante(dadosValidos())
      visitante.atualizar({ email: 'NOVO@EMAIL.COM' }, PapelUsuario.ADMINISTRADOR, new ObjectId())
      expect(visitante.email).toBe('novo@email.com')
    })

    it('deve atualizar atualizadoEm e atualizadoPor', () => {
      const visitante = new Visitante(dadosValidos())
      const novoResponsavel = new ObjectId()
      visitante.atualizar({ nomeCompleto: 'Novo' }, PapelUsuario.ADMINISTRADOR, novoResponsavel)
      expect(visitante.atualizadoPor).toEqual(novoResponsavel)
    })

    it('deve lançar erro para nome muito curto em atualizar()', () => {
      const visitante = new Visitante(dadosValidos())
      expect(() => {
        visitante.atualizar({ nomeCompleto: 'Jo' }, PapelUsuario.ADMINISTRADOR, new ObjectId())
      }).toThrow()
    })

    it('deve manter observacao como undefined quando não informada', () => {
      const visitante = new Visitante(dadosValidos())
      expect(visitante.observacao).toBeUndefined()
    })

    it('deve atualizar observacao para null (limpar)', () => {
      const visitante = new Visitante(dadosValidos())
      visitante.atualizar({ observacao: null }, PapelUsuario.ADMINISTRADOR, new ObjectId())
      expect(visitante.observacao).toBeUndefined()
    })
  })
})
