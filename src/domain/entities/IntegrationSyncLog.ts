export enum SyncType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  CONSENT_RENEWAL = 'consent_renewal',
}

export enum SyncStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  PARTIAL = 'partial',
}

export interface SyncMetadata {
  errorDetails?: string;
  affectedRecords?: string[];
  syncDurationMs?: number;
  memoryUsage?: number;
  [key: string]: any;
}

export class IntegrationSyncLog {
  constructor(
    public readonly id: string,
    public readonly integrationId: string,
    public readonly syncType: SyncType,
    public status: SyncStatus,
    public recordsProcessed: number,
    public recordsAdded: number,
    public recordsUpdated: number,
    public errorMessage: string | null,
    public readonly syncStartedAt: Date,
    public syncCompletedAt: Date | null,
    public metadata: SyncMetadata | null,
    public readonly createdAt: Date
  ) {}

  static create(
    integrationId: string,
    syncType: SyncType,
    syncStartedAt: Date = new Date()
  ): IntegrationSyncLog {
    return new IntegrationSyncLog(
      crypto.randomUUID(),
      integrationId,
      syncType,
      SyncStatus.SUCCESS,
      0,
      0,
      0,
      null,
      syncStartedAt,
      null,
      null,
      new Date()
    );
  }

  complete(
    recordsProcessed: number,
    recordsAdded: number,
    recordsUpdated: number,
    metadata?: SyncMetadata
  ): void {
    this.recordsProcessed = recordsProcessed;
    this.recordsAdded = recordsAdded;
    this.recordsUpdated = recordsUpdated;
    this.syncCompletedAt = new Date();
    this.metadata = metadata || null;

    if (recordsProcessed > recordsAdded + recordsUpdated) {
      this.status = SyncStatus.PARTIAL;
    } else {
      this.status = SyncStatus.SUCCESS;
    }
  }

  fail(errorMessage: string, metadata?: SyncMetadata): void {
    this.status = SyncStatus.ERROR;
    this.errorMessage = errorMessage;
    this.syncCompletedAt = new Date();
    this.metadata = {
      ...metadata,
      errorDetails: errorMessage,
    };
  }

  getDurationMs(): number | null {
    if (!this.syncCompletedAt) return null;
    return this.syncCompletedAt.getTime() - this.syncStartedAt.getTime();
  }

  isCompleted(): boolean {
    return this.syncCompletedAt !== null;
  }

  isSuccess(): boolean {
    return this.status === SyncStatus.SUCCESS;
  }

  isError(): boolean {
    return this.status === SyncStatus.ERROR;
  }

  getSuccessRate(): number {
    if (this.recordsProcessed === 0) return 1;
    return (this.recordsAdded + this.recordsUpdated) / this.recordsProcessed;
  }
}
