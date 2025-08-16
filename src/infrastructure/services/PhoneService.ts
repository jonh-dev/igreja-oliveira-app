import { IPhoneService } from '../../application/interfaces/services/IPhoneService';
import { supabase } from '../config/supabase';

export class PhoneService implements IPhoneService {
  async isPhoneAvailable(phone: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_phone_available', {
      phone_in: phone,
    });
    if (error) throw new Error(`Erro ao verificar telefone: ${error.message}`);
    return Boolean(data);
  }
}
