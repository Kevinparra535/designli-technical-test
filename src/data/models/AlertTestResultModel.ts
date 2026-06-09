// src/data/models/AlertTestResultModel.ts
//
// Transport model (DTO) for the POST /webhooks/:id/test response. Owns the
// single DTO→domain mapping for the test-notification result.

import { AlertTestResult } from '@/domain/entities/AlertTestResult';

export type AlertTestResultJson = {
  alertId: string;
  symbol: string;
  currentPrice: number;
  devices: number;
  sent: number;
  failed: number;
};

export class AlertTestResultModel {
  readonly alertId: string;
  readonly symbol: string;
  readonly currentPrice: number;
  readonly devices: number;
  readonly sent: number;
  readonly failed: number;

  constructor(json: AlertTestResultJson) {
    this.alertId = json.alertId;
    this.symbol = json.symbol;
    this.currentPrice = json.currentPrice;
    this.devices = json.devices;
    this.sent = json.sent;
    this.failed = json.failed;
  }

  static fromJson(json: AlertTestResultJson): AlertTestResultModel {
    return new AlertTestResultModel(json);
  }

  toDomain(): AlertTestResult {
    return new AlertTestResult({
      alertId: this.alertId,
      symbol: this.symbol,
      currentPrice: this.currentPrice,
      devices: this.devices,
      sent: this.sent,
      failed: this.failed,
      error: null,
    });
  }
}
