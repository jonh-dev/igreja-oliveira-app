import {
  Integration,
  IntegrationType,
} from '../../../domain/entities/Integration';
import { IntegrationSyncLog } from '../../../domain/entities/IntegrationSyncLog';
import { IIntegrationRepository } from '../../interfaces/IIntegrationRepository';

export interface GetIntegrationsDto {
  userId: string;
  type?: IntegrationType;
  includeInactive?: boolean;
}

export interface IntegrationWithLogs {
  integration: Integration;
  recentSyncLogs: IntegrationSyncLog[];
  lastSyncLog?: IntegrationSyncLog;
}

export class GetIntegrationsUseCase {
  constructor(private integrationRepository: IIntegrationRepository) {}

  async execute(dto: GetIntegrationsDto): Promise<IntegrationWithLogs[]> {
    let integrations: Integration[];

    if (dto.type) {
      integrations = await this.integrationRepository.findByUserIdAndType(
        dto.userId,
        dto.type
      );
    } else {
      integrations = await this.integrationRepository.findByUserId(dto.userId);
    }

    // Filter inactive if needed
    if (!dto.includeInactive) {
      integrations = integrations.filter(integration => integration.isActive);
    }

    // Get sync logs for each integration
    const integrationsWithLogs: IntegrationWithLogs[] = [];

    for (const integration of integrations) {
      const recentSyncLogs =
        await this.integrationRepository.findSyncLogsByIntegration(
          integration.id,
          5 // Last 5 sync attempts
        );

      const lastSyncLog =
        recentSyncLogs.length > 0 ? recentSyncLogs[0] : undefined;

      integrationsWithLogs.push({
        integration,
        recentSyncLogs,
        lastSyncLog,
      });
    }

    return integrationsWithLogs;
  }
}
