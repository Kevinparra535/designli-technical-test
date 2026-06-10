import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'Correo no válido.'),
  password: z.string().min(6, 'Mínimo 6 caracteres.'),
});

export const stockAlertSchema = z.object({
  symbol: z.string().trim().min(1, 'Enter a symbol.'),
  targetPrice: z
    .string()
    .min(1, 'Enter a price.')
    .refine((v) => {
      const n = Number(v.replace(',', '.'));
      return Number.isFinite(n) && n > 0;
    }, 'Enter a valid price greater than 0.'),
  condition: z.enum(['above', 'below']),
});
