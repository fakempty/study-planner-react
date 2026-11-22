import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Назва завдання є обовʼязковою.'),
  description: z.string().trim(),
  category: z.string().trim().min(1, 'Вкажіть категорію.'),
  priority: z.enum(['low', 'medium', 'high']),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;
