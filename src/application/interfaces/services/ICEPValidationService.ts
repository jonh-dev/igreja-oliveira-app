export interface CEPInfo {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export interface ICEPValidationService {
  validateCEP(cep: string): Promise<CEPInfo | null>;
}
