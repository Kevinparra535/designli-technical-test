// src/domain/entities/StockAlert.ts
//
// Stock price alert domain entity. Pure data class — no framework/infra imports.
// `id`, `active` and `createdAt` are assigned by the backend; a draft built in
// the UI carries id="" / createdAt=null until it is created.

export type AlertCondition = 'above' | 'below';

export interface ConstructorParams {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: AlertCondition;
  active: boolean;
  createdAt: string | null;
  error?: string | null;
  [key: string]: any;
}

export class StockAlert {
  public id: ConstructorParams['id'];
  public symbol: ConstructorParams['symbol'];
  public targetPrice: ConstructorParams['targetPrice'];
  public condition: ConstructorParams['condition'];
  public active: ConstructorParams['active'];
  public createdAt: ConstructorParams['createdAt'];
  public error?: ConstructorParams['error'];
  [key: string]: any;

  constructor(model: ConstructorParams) {
    this.id = model.id;
    this.symbol = model.symbol;
    this.targetPrice = model.targetPrice;
    this.condition = model.condition;
    this.active = model.active;
    this.createdAt = model.createdAt;
    this.error = model.error;
  }
}
