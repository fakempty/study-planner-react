import { useEffect, useState } from 'react';
import { UNDO_DURATION_MS } from '../context/taskContext';
import { useTaskContext } from '../hooks/useTaskContext';
import './Toast.scss';

function Toast() {
  const { toast, undoDelete, dismissToast } = useTaskContext();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast?.undoable) {
      return;
    }

    const startTime = Date.now();
    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPercent = Math.max(
        0,
        100 - (elapsed / UNDO_DURATION_MS) * 100
      );
      setProgress(remainingPercent);

      if (elapsed >= UNDO_DURATION_MS) {
        window.clearInterval(intervalId);
      }
    }, 50);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [toast]);

  if (!toast) {
    return null;
  }

  return (
    <div
      className={`toast toast--${toast.variant}`}
      role="status"
      aria-live="polite"
    >
      <div className="toast__content">
        <p className="toast__text">{toast.text}</p>

        <div className="toast__actions">
          {toast.undoable && (
            <button
              type="button"
              className="toast__undo"
              onClick={undoDelete}
            >
              Скасувати
            </button>
          )}
          <button
            type="button"
            className="toast__close"
            aria-label="Закрити сповіщення"
            onClick={dismissToast}
          >
            ×
          </button>
        </div>
      </div>

      {toast.undoable && (
        <div className="toast__progress-track" aria-hidden="true">
          <div
            className="toast__progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default Toast;
