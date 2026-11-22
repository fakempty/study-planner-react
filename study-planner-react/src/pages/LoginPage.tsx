import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { loginSchema } from '../schemas/authSchema';
import type { LoginFormValues } from '../schemas/authSchema';
import '../components/TaskForm.scss';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null);
    try {
      await login(values.username, values.password);
      void navigate('/profile');
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Не вдалося виконати вхід. Перевірте логін та пароль.'
      );
    }
  };

  return (
    <section aria-label="Вхід у систему">
      <form
        className="task-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <h2 className="task-form__heading">Вхід (Login)</h2>

        <div className="task-form__field">
          <label className="task-form__label" htmlFor="login-username">
            Username *
          </label>
          <input
            id="login-username"
            type="text"
            className="task-form__input"
            disabled={isSubmitting}
            {...register('username')}
          />
          {errors.username && (
            <p className="task-form__error" role="alert">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="task-form__field">
          <label className="task-form__label" htmlFor="login-password">
            Password *
          </label>
          <input
            id="login-password"
            type="password"
            className="task-form__input"
            disabled={isSubmitting}
            {...register('password')}
          />
          {errors.password && (
            <p className="task-form__error" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {authError && (
          <p className="task-form__error" role="alert">
            {authError}
          </p>
        )}

        <button
          type="submit"
          className="task-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Вхід...' : 'Увійти'}
        </button>
      </form>
    </section>
  );
}
