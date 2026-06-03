export interface RepositorioContador {
  proximoNumero(nome: string): Promise<number>
}
