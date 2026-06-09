// src/data/models/UserModel.ts
//
// Transport model (DTO) for the backend's user payload ({ id, email, createdAt }).
// Owns the DTO→domain mapping.

import { User } from '@/domain/entities/User';

export type UserJson = {
  id: string;
  email: string;
  // Present on /auth/register; omitted by /auth/login and /auth/me.
  createdAt?: string;
};

export class UserModel {
  readonly id: string;
  readonly email: string;
  readonly createdAt: string | null;

  constructor(json: UserJson) {
    this.id = json.id;
    this.email = json.email;
    this.createdAt = json.createdAt ?? null;
  }

  static fromJson(json: UserJson): UserModel {
    return new UserModel(json);
  }

  toDomain(): User {
    return new User({
      id: this.id,
      email: this.email,
      createdAt: this.createdAt,
      error: null,
    });
  }
}
