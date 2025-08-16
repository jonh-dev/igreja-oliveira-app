import {
  Integration,
  IntegrationType,
  IntegrationStatus,
} from '../../domain/entities/Integration';
import { IntegrationSyncLog } from '../../domain/entities/IntegrationSyncLog';

export interface IIntegrationRepository {
  // Integration CRUD
  create(integration: Integration): Promise<Integration>;
  findById(id: string): Promise<Integration | null>;
  findByUserId(userId: string): Promise<Integration[]>;
  findByUserIdAndType(
    userId: string,
    type: IntegrationType
  ): Promise<Integration[]>;
  findByProvider(provider: string): Promise<Integration[]>;
  findByStatus(status: IntegrationStatus): Promise<Integration[]>;
  update(integration: Integration): Promise<Integration>;
  delete(id: string): Promise<void>;

  // Secure credential management
  encryptAndStoreCredentials(
    integrationId: string,
    credentials: any
  ): Promise<void>;
  decryptCredentials(integrationId: string): Promise<any | null>;
  deleteCredentials(integrationId: string): Promise<void>;

  // Sync management
  findDueForSync(): Promise<Integration[]>;
  findExpiredConsents(): Promise<Integration[]>;

  // Sync log management
  createSyncLog(syncLog: IntegrationSyncLog): Promise<IntegrationSyncLog>;
  findSyncLogsByIntegration(
    integrationId: string,
    limit?: number
  ): Promise<IntegrationSyncLog[]>;
  findRecentSyncLogs(limit?: number): Promise<IntegrationSyncLog[]>;
  deleteSyncLogsOlderThan(date: Date): Promise<number>;
}
