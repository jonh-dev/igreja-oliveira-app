export enum IntegrationType {
  BANKING = 'banking',
  PAYMENT = 'payment',
  MEMBERS = 'members',
  EVENTS = 'events',
}

export enum IntegrationStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  PENDING = 'pending',
}

export interface IntegrationPermissions {
  canReadBalance: boolean;
  canReadStatements: boolean;
  canReadTransactions: boolean;
  scope: string[];
  expiresAt: Date;
}

export interface IntegrationCredentials {
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  consentId?: string;
  [key: string]: any;
}

export interface IntegrationMetadata {
  accountNumber?: string;
  agency?: string;
  bankName?: string;
  accountType?: string;
  lastSyncRecords?: number;
  syncErrors?: string[];
  [key: string]: any;
}

export class Integration {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly integrationType: IntegrationType,
    public readonly provider: string,
    public readonly providerAccountId: string | null,
    public status: IntegrationStatus,
    public encryptedCredentials: string | null,
    public consentId: string | null,
    public consentExpiresAt: Date | null,
    public lastSyncAt: Date | null,
    public syncFrequencyHours: number,
    public permissions: IntegrationPermissions | null,
    public metadata: IntegrationMetadata | null,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(
    userId: string,
    integrationType: IntegrationType,
    provider: string,
    providerAccountId: string | null = null
  ): Integration {
    const now = new Date();
    return new Integration(
      crypto.randomUUID(),
      userId,
      integrationType,
      provider,
      providerAccountId,
      IntegrationStatus.DISCONNECTED,
      null,
      null,
      null,
      null,
      24, // Default sync every 24 hours
      null,
      null,
      true,
      now,
      now
    );
  }

  connect(
    credentials: IntegrationCredentials,
    permissions: IntegrationPermissions,
    consentId: string,
    consentExpiresAt: Date
  ): void {
    this.status = IntegrationStatus.CONNECTED;
    this.consentId = consentId;
    this.consentExpiresAt = consentExpiresAt;
    this.permissions = permissions;
    this.updatedAt = new Date();
  }

  disconnect(): void {
    this.status = IntegrationStatus.DISCONNECTED;
    this.encryptedCredentials = null;
    this.consentId = null;
    this.consentExpiresAt = null;
    this.permissions = null;
    this.lastSyncAt = null;
    this.updatedAt = new Date();
  }

  updateSyncStatus(lastSyncAt: Date): void {
    this.lastSyncAt = lastSyncAt;
    this.updatedAt = new Date();
  }

  markAsError(errorMetadata?: any): void {
    this.status = IntegrationStatus.ERROR;
    if (errorMetadata && this.metadata) {
      this.metadata.syncErrors = [
        ...(this.metadata.syncErrors || []),
        errorMetadata,
      ];
    }
    this.updatedAt = new Date();
  }

  isConsentExpired(): boolean {
    if (!this.consentExpiresAt) return true;
    return new Date() >= this.consentExpiresAt;
  }

  isConnected(): boolean {
    return (
      this.status === IntegrationStatus.CONNECTED && !this.isConsentExpired()
    );
  }

  canSync(): boolean {
    return this.isConnected() && this.isActive;
  }

  shouldSync(): boolean {
    if (!this.canSync()) return false;
    if (!this.lastSyncAt) return true;

    const hoursSinceLastSync =
      (Date.now() - this.lastSyncAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastSync >= this.syncFrequencyHours;
  }
}
