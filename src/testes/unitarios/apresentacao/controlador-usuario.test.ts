import { describe, it, expect, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { ControladorUsuario } from '@/modulos/usuarios/apresentacao/controladores/controlador-usuario'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'
import type { CadastrarUsuario } from '@/modulos/usuarios/aplicacao/casos-de-uso/cadastrar-usuario'
import type { ListarUsuarios } from '@/modulos/usuarios/aplicacao/casos-de-uso/listar-usuarios'
import type { AtualizarUsuario } from '@/modulos/usuarios/aplicacao/casos-de-uso/atualizar-usuario'

function criarRespostaUsuarioMock(parcial: Partial<Record<string, unknown>> = {}) {
  return {
    id: new ObjectId().toString(),
    nome: 'João',
    sobrenome: 'Silva',
    email: 'joao@empresa.com',
    matricula: 'RECEP0000001',
    papel: PapelUsuario.RECEPCIONISTA,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    ...parcial,
  }
}

function criarMocks() {
  const executarCadastrar = vi.fn().mockResolvedValue(criarRespostaUsuarioMock())
  const cadastrarUsuario = { executar: executarCadastrar } as unknown as CadastrarUsuario

  const executarListar = vi.fn().mockResolvedValue({
    usuarios: [],
    paginacao: { total: 0, pagina: 1, itensPorPagina: 20, totalPaginas: 0 },
  })
  const listarUsuarios = { executar: executarListar } as unknown as ListarUsuarios

  const executarAtualizar = vi.fn().mockResolvedValue(criarRespostaUsuarioMock())
  const atualizarUsuario = { executar: executarAtualizar } as unknown as AtualizarUsuario

  return { cadastrarUsuario, listarUsuarios, atualizarUsuario, executarCadastrar, executarListar, executarAtualizar }
}

describe('ControladorUsuario', () => {
  describe('cadastrar()', () => {
    it('deve delegar ao caso de uso e retornar DTO', async () => {
      const { cadastrarUsuario, listarUsuarios, atualizarUsuario, executarCadastrar } = criarMocks()
      const controlador = new ControladorUsuario(cadastrarUsuario, listarUsuarios, atualizarUsuario)
      const requisitanteId = new ObjectId().toString()

      const resultado = await controlador.cadastrar(
        {
          nome: 'João',
          sobrenome: 'Silva',
          telefone: '11999999999',
          email: 'joao@empresa.com',
          senha: 'Senha@123',
          papel: PapelUsuario.RECEPCIONISTA,
        },
        requisitanteId,
      )

      expect(executarCadastrar).toHaveBeenCalledOnce()
      expect(resultado.nome).toBe('João')
    })
  })

  describe('listar()', () => {
    it('deve delegar ao caso de uso com paginação e retornar lista', async () => {
      const { cadastrarUsuario, listarUsuarios, atualizarUsuario, executarListar } = criarMocks()
      const controlador = new ControladorUsuario(cadastrarUsuario, listarUsuarios, atualizarUsuario)

      const resultado = await controlador.listar({ pagina: 1, itensPorPagina: 20 })

      expect(executarListar).toHaveBeenCalledWith({ pagina: 1, itensPorPagina: 20 })
      expect(resultado.usuarios).toHaveLength(0)
    })
  })

  describe('atualizar()', () => {
    it('deve incluir nome no DTO quando nome é fornecido', async () => {
      const { cadastrarUsuario, listarUsuarios, atualizarUsuario } = criarMocks()
      const controlador = new ControladorUsuario(cadastrarUsuario, listarUsuarios, atualizarUsuario)
      const id = new ObjectId().toString()
      const requisitanteId = new ObjectId().toString()

      await controlador.atualizar(id, { nome: 'Carlos' }, requisitanteId)

      const chamada = (atualizarUsuario.executar as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>
      expect(chamada.nome).toBe('Carlos')
    })

    it('deve incluir sobrenome no DTO quando sobrenome é fornecido', async () => {
      const { cadastrarUsuario, listarUsuarios, atualizarUsuario } = criarMocks()
      const controlador = new ControladorUsuario(cadastrarUsuario, listarUsuarios, atualizarUsuario)
      const id = new ObjectId().toString()
      const requisitanteId = new ObjectId().toString()

      await controlador.atualizar(id, { sobrenome: 'Oliveira' }, requisitanteId)

      const chamada = (atualizarUsuario.executar as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>
      expect(chamada.sobrenome).toBe('Oliveira')
    })

    it('deve incluir telefone no DTO quando telefone é fornecido', async () => {
      const { cadastrarUsuario, listarUsuarios, atualizarUsuario } = criarMocks()
      const controlador = new ControladorUsuario(cadastrarUsuario, listarUsuarios, atualizarUsuario)
      const id = new ObjectId().toString()
      const requisitanteId = new ObjectId().toString()

      await controlador.atualizar(id, { telefone: '11888887777' }, requisitanteId)

      const chamada = (atualizarUsuario.executar as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>
      expect(chamada.telefone).toBe('11888887777')
    })

    it('não deve incluir nome no DTO quando nome não é fornecido (undefined)', async () => {
      const { cadastrarUsuario, listarUsuarios, atualizarUsuario } = criarMocks()
      const controlador = new ControladorUsuario(cadastrarUsuario, listarUsuarios, atualizarUsuario)
      const id = new ObjectId().toString()
      const requisitanteId = new ObjectId().toString()

      await controlador.atualizar(id, { telefone: '11777776666' }, requisitanteId)

      const chamada = (atualizarUsuario.executar as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>
      expect(chamada).not.toHaveProperty('nome')
    })

    it('não deve incluir sobrenome no DTO quando sobrenome não é fornecido (undefined)', async () => {
      const { cadastrarUsuario, listarUsuarios, atualizarUsuario } = criarMocks()
      const controlador = new ControladorUsuario(cadastrarUsuario, listarUsuarios, atualizarUsuario)
      const id = new ObjectId().toString()
      const requisitanteId = new ObjectId().toString()

      await controlador.atualizar(id, { nome: 'Carlos' }, requisitanteId)

      const chamada = (atualizarUsuario.executar as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>
      expect(chamada).not.toHaveProperty('sobrenome')
    })

    it('não deve incluir telefone no DTO quando telefone não é fornecido (undefined)', async () => {
      const { cadastrarUsuario, listarUsuarios, atualizarUsuario } = criarMocks()
      const controlador = new ControladorUsuario(cadastrarUsuario, listarUsuarios, atualizarUsuario)
      const id = new ObjectId().toString()
      const requisitanteId = new ObjectId().toString()

      await controlador.atualizar(id, { nome: 'Carlos' }, requisitanteId)

      const chamada = (atualizarUsuario.executar as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>
      expect(chamada).not.toHaveProperty('telefone')
    })

    it('deve incluir todos os campos quando todos são fornecidos', async () => {
      const { cadastrarUsuario, listarUsuarios, atualizarUsuario } = criarMocks()
      const controlador = new ControladorUsuario(cadastrarUsuario, listarUsuarios, atualizarUsuario)
      const id = new ObjectId().toString()
      const requisitanteId = new ObjectId().toString()

      await controlador.atualizar(
        id,
        { nome: 'Carlos', sobrenome: 'Ferreira', telefone: '11999998888' },
        requisitanteId,
      )

      const chamada = (atualizarUsuario.executar as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>
      expect(chamada.nome).toBe('Carlos')
      expect(chamada.sobrenome).toBe('Ferreira')
      expect(chamada.telefone).toBe('11999998888')
    })

    it('deve repassar id e requisitanteId ao caso de uso', async () => {
      const { cadastrarUsuario, listarUsuarios, atualizarUsuario } = criarMocks()
      const controlador = new ControladorUsuario(cadastrarUsuario, listarUsuarios, atualizarUsuario)
      const id = new ObjectId().toString()
      const requisitanteId = new ObjectId().toString()

      await controlador.atualizar(id, { nome: 'Carlos' }, requisitanteId)

      const chamada = (atualizarUsuario.executar as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>
      expect(chamada.id).toBe(id)
      expect(chamada.requisitanteId).toBe(requisitanteId)
    })
  })
})
