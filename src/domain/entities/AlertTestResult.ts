// src/domain/entities/AlertTestResult.ts
//
// Result of firing a test notification for a stock price alert. Pure data class
// — no framework/infra imports. `devices` is how many active device tokens the
// alert's owner has; `sent`/`failed` are the per-device push outcomes.

export interface ConstructorParams {
  alertId: string;
  symbol: string;
  currentPrice: number;
  devices: number;
  sent: number;
  failed: number;
  error?: string | null;
  [key: string]: any;
}

export class AlertTestResult {
  public alertId: ConstructorParams['alertId'];
  public symbol: ConstructorParams['symbol'];
  public currentPrice: ConstructorParams['currentPrice'];
  public devices: ConstructorParams['devices'];
  public sent: ConstructorParams['sent'];
  public failed: ConstructorParams['failed'];
  public error?: ConstructorParams['error'];
  [key: string]: any;

  constructor(model: ConstructorParams) {
    this.alertId = model.alertId;
    this.symbol = model.symbol;
    this.currentPrice = model.currentPrice;
    this.devices = model.devices;
    this.sent = model.sent;
    this.failed = model.failed;
    this.error = model.error;
  }
}
