import { ObjectId } from 'mongodb'
import { hashSenha } from '@/compartilhado/utilitarios/criptografia'
import { ErroEmailJaCadastrado } from '@/compartilhado/erros/erro-email-ja-cadastrado'
import { ErroSenhaInvalida } from '@/compartilhado/erros/erro-senha-invalida'
import type { RepositorioUsuario } from '@/modulos/usuarios/dominio/repositorios/repositorio-usuario'
import type { RepositorioContador } from '@/compartilhado/repositorios/repositorio-contador'
import { Usuario } from '@/modulos/usuarios/dominio/entidades/usuario'
import { Email } from '@/modulos/usuarios/dominio/value-objects/email'
import { Matricula } from '@/modulos/usuarios/dominio/value-objects/matricula'
import type {
  EntradaCadastrarUsuarioDTO,
} from '@/modulos/usuarios/aplicacao/dtos/entrada-cadastrar-usuario.dto'
import type { RespostaUsuarioDTO } from '@/modulos/usuarios/aplicacao/dtos/resposta-usuario.dto'

export class CadastrarUsuario {
  constructor(
    private readonly repositorioUsuario: RepositorioUsuario,
    private readonly repositorioContador: RepositorioContador,
  ) {}

  async executar(dados: EntradaCadastrarUsuarioDTO): Promise<RespostaUsuarioDTO> {
    if (dados.senha.length < 8) throw new ErroSenhaInvalida()

    const email = new Email(dados.email)

    const emailExistente = await this.repositorioUsuario.buscarPorEmail(email.valor)
    if (emailExistente) throw new ErroEmailJaCadastrado()

    const senhaHash = await hashSenha(dados.senha)

    const numero = await this.repositorioContador.proximoNumero('usuario')
    const matriculaStr = Matricula.formatar(numero)

    const agora = new Date()
    const requisitanteObjectId = new ObjectId(dados.requisitanteId)
    const id = new ObjectId()

    const usuario = new Usuario({
      id,
      nome: dados.nome,
      sobrenome: dados.sobrenome,
      telefone: dados.telefone,
      email: email.valor,
      senhaHash,
      matricula: matriculaStr,
      papel: dados.papel,
      criadoEm: agora,
      atualizadoEm: agora,
      criadoPor: requisitanteObjectId,
      atualizadoPor: requisitanteObjectId,
    })

    await this.repositorioUsuario.criar(usuario)

    return {
      id: usuario.id.toString(),
      nome: usuario.nome,
      sobrenome: usuario.sobrenome,
      email: usuario.email,
      matricula: usuario.matricula,
      papel: usuario.papel,
      criadoEm: usuario.criadoEm.toISOString(),
      atualizadoEm: usuario.atualizadoEm.toISOString(),
    }
  }
}
