import { ObjectId } from 'mongodb'
import { ErroVisitanteJaCadastradoHoje } from '@/compartilhado/erros/erro-visitante-ja-cadastrado-hoje'
import { ErroVisitanteNaoEncontrado } from '@/compartilhado/erros/erro-visitante-nao-encontrado'
import { ErroSetorNaoEncontrado } from '@/compartilhado/erros/erro-setor-nao-encontrado'
import type { RepositorioContador } from '@/compartilhado/repositorios/repositorio-contador'
import type { RepositorioUsuario } from '@/modulos/usuarios/dominio/repositorios/repositorio-usuario'
import type { RepositorioSetor } from '@/modulos/setores/dominio/repositorios/repositorio-setor'
import type { RepositorioVisitante } from '@/modulos/visitantes/dominio/repositorios/repositorio-visitante'
import type { ServicoDominioVisitante } from '@/modulos/visitantes/dominio/servicos/servico-dominio-visitante'
import { Visitante } from '@/modulos/visitantes/dominio/entidades/visitante'
import { CodigoVisitante } from '@/modulos/visitantes/dominio/value-objects/codigo-visitante'
import type { EntradaCadastrarVisitanteDTO } from '@/modulos/visitantes/aplicacao/dtos/entrada-cadastrar-visitante.dto'
import type { RespostaVisitanteDTO } from '@/modulos/visitantes/aplicacao/dtos/resposta-visitante.dto'

export class CadastrarVisitante {
  constructor(
    private readonly repositorioVisitante: RepositorioVisitante,
    private readonly repositorioContador: RepositorioContador,
    private readonly repositorioUsuario: RepositorioUsuario,
    private readonly repositorioSetor: RepositorioSetor,
    private readonly servicoDominio: ServicoDominioVisitante,
  ) {}

  async executar(dados: EntradaCadastrarVisitanteDTO): Promise<RespostaVisitanteDTO> {
    const agora = new Date()
    this.servicoDominio.validarDiaPermitido(agora)
    this.servicoDominio.validarHorarioPermitido(agora)

    const recepcionista = await this.repositorioUsuario.buscarPorId(new ObjectId(dados.requisitanteId))
    if (!recepcionista) throw new ErroVisitanteNaoEncontrado()

    const setor = await this.repositorioSetor.buscarPorNome(dados.setorDestinoNome.trim())
    if (!setor) throw new ErroSetorNaoEncontrado()

    const cpfNormalizado = dados.cpf.replace(/\D/g, '')
    const { inicioDia, fimDia } = this.servicoDominio.obterIntervaloHoje(agora)
    const jaExiste = await this.repositorioVisitante.buscarPorCpfEData(cpfNormalizado, inicioDia, fimDia)
    if (jaExiste) throw new ErroVisitanteJaCadastradoHoje()

    const numero = await this.repositorioContador.proximoNumero('visitante')
    const codigoStr = CodigoVisitante.formatar(numero)

    const requisitanteId = new ObjectId(dados.requisitanteId)
    const id = new ObjectId()

    const visitante = new Visitante({
      id,
      codigoVisitante: codigoStr,
      cpf: cpfNormalizado,
      nomeCompleto: dados.nomeCompleto,
      dataNascimento: new Date(dados.dataNascimento),
      telefone: dados.telefone,
      email: dados.email,
      setorDestinoId: setor.id,
      observacao: dados.observacao,
      recepcionistaId: requisitanteId,
      recepcionistaNome: `${recepcionista.nome} ${recepcionista.sobrenome}`,
      recepcionistaMatricula: recepcionista.matricula,
      criadoEm: agora,
      atualizadoEm: agora,
      criadoPor: requisitanteId,
      atualizadoPor: requisitanteId,
    })

    await this.repositorioVisitante.criar(visitante)
    return visitanteParaDTO(visitante)
  }
}

export function visitanteParaDTO(v: Visitante): RespostaVisitanteDTO {
  return {
    id: v.id.toString(),
    codigoVisitante: v.codigoVisitante,
    cpf: v.cpf,
    nomeCompleto: v.nomeCompleto,
    dataNascimento: v.dataNascimento.toISOString(),
    telefone: v.telefone,
    email: v.email,
    setorDestinoId: v.setorDestinoId.toString(),
    observacao: v.observacao,
    recepcionistaId: v.recepcionistaId.toString(),
    recepcionistaNome: v.recepcionistaNome,
    recepcionistaMatricula: v.recepcionistaMatricula,
    criadoEm: v.criadoEm.toISOString(),
    atualizadoEm: v.atualizadoEm.toISOString(),
  }
}
