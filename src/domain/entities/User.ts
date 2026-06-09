// src/domain/entities/User.ts
//
// Authenticated user. Pure data class, no framework imports.

export interface ConstructorParams {
  id: string;
  email: string;
  // Only the /auth/register response carries createdAt; /login and /me omit it.
  createdAt?: string | null;
  error?: string | null;
  [key: string]: any;
}

export class User {
  public id: ConstructorParams['id'];
  public email: ConstructorParams['email'];
  public createdAt?: ConstructorParams['createdAt'];
  public error?: ConstructorParams['error'];
  [key: string]: any;

  constructor(model: ConstructorParams) {
    this.id = model.id;
    this.email = model.email;
    this.createdAt = model.createdAt;
    this.error = model.error;
  }
}
