import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Логін є обовʼязковим.'),
  password: z
    .string()
    .min(6, 'Пароль повинен містити щонайменше 6 символів.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
