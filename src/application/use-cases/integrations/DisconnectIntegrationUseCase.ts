import { Integration } from '../../../domain/entities/Integration';
import { IIntegrationRepository } from '../../interfaces/IIntegrationRepository';

export interface DisconnectIntegrationDto {
  integrationId: string;
  userId: string; // For authorization check
  deleteCompletely?: boolean; // If true, deletes the integration record
}

export class DisconnectIntegrationUseCase {
  constructor(private integrationRepository: IIntegrationRepository) {}

  async execute(dto: DisconnectIntegrationDto): Promise<void> {
    // Find the integration
    const integration = await this.integrationRepository.findById(
      dto.integrationId
    );

    if (!integration) {
      throw new Error('Integration not found');
    }

    // Verify user owns this integration
    if (integration.userId !== dto.userId) {
      throw new Error('Unauthorized: User does not own this integration');
    }

    if (dto.deleteCompletely) {
      // Delete all credentials
      await this.integrationRepository.deleteCredentials(integration.id);

      // Delete the integration record completely
      await this.integrationRepository.delete(integration.id);
    } else {
      // Just disconnect but keep the record
      integration.disconnect();

      // Delete sensitive credentials
      await this.integrationRepository.deleteCredentials(integration.id);

      // Update the integration status
      await this.integrationRepository.update(integration);
    }
  }
}
