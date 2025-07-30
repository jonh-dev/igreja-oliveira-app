import { ICEPValidationService, CEPInfo } from '../../application/interfaces/services/ICEPValidationService';

export class ViaCEPService implements ICEPValidationService {
  private readonly baseUrl = 'https://viacep.com.br/ws';

  async validateCEP(cep: string): Promise<CEPInfo | null> {
    try {
      const cleanCep = cep.replace(/\D/g, '');
      
      if (!/^\d{8}$/.test(cleanCep)) {
        throw new Error('CEP deve ter 8 dígitos numéricos');
      }

      const response = await fetch(`${this.baseUrl}/${cleanCep}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao consultar CEP');
      }

      const data = await response.json();
      
      if (data.erro) {
        return null;
      }

      return {
        cep: data.cep,
        logradouro: data.logradouro,
        complemento: data.complemento,
        bairro: data.bairro,
        localidade: data.localidade,
        uf: data.uf,
        ibge: data.ibge,
        gia: data.gia,
        ddd: data.ddd,
        siafi: data.siafi
      };
    } catch (error) {
      console.error('Erro ao validar CEP:', error);
      return null;
    }
  }
}