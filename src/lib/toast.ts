import toast from 'react-hot-toast';

/**
 * Toast notification utility with custom Tailwind styling
 * Provides consistent toast notifications across the app
 */
export const showToast = {
  /**
   * Show success toast
   */
  success: (message: string, duration = 4000) => {
    toast.success(message, {
      duration,
      position: 'top-right',
      className: 'bg-green-50 text-green-900 border border-green-200 shadow-lg',
      iconTheme: {
        primary: '#10B981',
        secondary: '#FFFFFF',
      },
    });
  },

  /**
   * Show error toast
   */
  error: (message: string, duration = 5000) => {
    toast.error(message, {
      duration,
      position: 'top-right',
      className: 'bg-red-50 text-red-900 border border-red-200 shadow-lg',
      iconTheme: {
        primary: '#EF4444',
        secondary: '#FFFFFF',
      },
    });
  },

  /**
   * Show loading toast
   * Returns toast ID for dismissal
   */
  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
      className: 'bg-blue-50 text-blue-900 border border-blue-200 shadow-lg',
    });
  },

  /**
   * Show warning/info toast
   */
  info: (message: string, duration = 4000) => {
    toast(message, {
      duration,
      position: 'top-right',
      icon: 'ℹ️',
      className: 'bg-blue-50 text-blue-900 border border-blue-200 shadow-lg',
    });
  },

  /**
   * Dismiss a specific toast
   */
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss();
  },

  /**
   * Show toast for promise-based operations
   * Automatically shows loading, success, or error based on promise state
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        position: 'top-right',
        success: {
          className: 'bg-green-50 text-green-900 border border-green-200 shadow-lg',
          iconTheme: {
            primary: '#10B981',
            secondary: '#FFFFFF',
          },
        },
        error: {
          className: 'bg-red-50 text-red-900 border border-red-200 shadow-lg',
          iconTheme: {
            primary: '#EF4444',
            secondary: '#FFFFFF',
          },
        },
        loading: {
          className: 'bg-blue-50 text-blue-900 border border-blue-200 shadow-lg',
        },
      }
    );
  },
};

/**
 * Helper function to extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unexpected error occurred';
}
