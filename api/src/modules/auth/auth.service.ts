// src/modules/auth/auth.service.ts

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { env } from '../../config/env';
import { HttpError } from '../../lib/httpError';
import type { AuthPayload } from '../../middleware/auth';

import * as repo from './auth.repository';

export interface PublicUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthResult {
  token: string;
  user: PublicUser;
}

function toPublicUser(row: repo.UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at.toISOString(),
  };
}

function signToken(user: PublicUser): string {
  const payload: AuthPayload = { sub: user.id, email: user.email };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export async function register(
  email: string,
  password: string,
): Promise<AuthResult> {
  const existing = await repo.findByEmail(email);
  if (existing) throw HttpError.conflict('Email already registered');

  const passwordHash = await bcrypt.hash(password, 10);
  const row = await repo.createUser(email, passwordHash);
  const user = toPublicUser(row);
  return { token: signToken(user), user };
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResult> {
  const row = await repo.findByEmail(email);
  if (!row) throw HttpError.unauthorized('Invalid credentials');

  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) throw HttpError.unauthorized('Invalid credentials');

  const user = toPublicUser(row);
  return { token: signToken(user), user };
}
