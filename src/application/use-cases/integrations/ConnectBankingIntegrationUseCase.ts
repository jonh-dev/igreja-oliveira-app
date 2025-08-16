import {
  Integration,
  IntegrationType,
  IntegrationCredentials,
  IntegrationPermissions,
} from '../../../domain/entities/Integration';
import { IIntegrationRepository } from '../../interfaces/IIntegrationRepository';

export interface ConnectBankingIntegrationDto {
  userId: string;
  provider: string;
  providerAccountId?: string;
  consentId: string;
  consentExpiresAt: Date;
  credentials: IntegrationCredentials;
  permissions: IntegrationPermissions;
  metadata?: any;
}

export class ConnectBankingIntegrationUseCase {
  constructor(private integrationRepository: IIntegrationRepository) {}

  async execute(dto: ConnectBankingIntegrationDto): Promise<Integration> {
    // Check if integration already exists for this user and provider
    const existingIntegrations =
      await this.integrationRepository.findByUserIdAndType(
        dto.userId,
        IntegrationType.BANKING
      );

    const existingIntegration = existingIntegrations.find(
      integration => integration.provider === dto.provider
    );

    let integration: Integration;

    if (existingIntegration) {
      // Update existing integration
      existingIntegration.connect(
        dto.credentials,
        dto.permissions,
        dto.consentId,
        dto.consentExpiresAt
      );

      if (dto.metadata) {
        existingIntegration.metadata = {
          ...existingIntegration.metadata,
          ...dto.metadata,
        };
      }

      integration =
        await this.integrationRepository.update(existingIntegration);
    } else {
      // Create new integration
      integration = Integration.create(
        dto.userId,
        IntegrationType.BANKING,
        dto.provider,
        dto.providerAccountId
      );

      integration.connect(
        dto.credentials,
        dto.permissions,
        dto.consentId,
        dto.consentExpiresAt
      );

      if (dto.metadata) {
        integration.metadata = dto.metadata;
      }

      integration = await this.integrationRepository.create(integration);
    }

    // Store encrypted credentials securely
    await this.integrationRepository.encryptAndStoreCredentials(
      integration.id,
      dto.credentials
    );

    return integration;
  }
}
