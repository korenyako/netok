import toast from 'react-hot-toast';

/**
 * Notification utilities for user feedback
 */
export const notifications = {
  /**
   * Show success notification
   */
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#3CB57F',
        color: '#fff',
        fontWeight: '500',
        padding: '12px 20px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#3CB57F',
      },
    });
  },

  /**
   * Show error notification
   */
  error: (message: string) => {
    toast.error(message, {
      duration: 6000,
      position: 'top-center',
      style: {
        background: '#EF4444',
        color: '#fff',
        fontWeight: '500',
        padding: '12px 20px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#EF4444',
      },
    });
  },

  /**
   * Show info notification
   */
  info: (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#3B82F6',
        color: '#fff',
        fontWeight: '500',
        padding: '12px 20px',
        borderRadius: '8px',
      },
      icon: 'ℹ️',
    });
  },

  /**
   * Show warning notification
   */
  warn: (message: string) => {
    toast(message, {
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#F59E0B',
        color: '#fff',
        fontWeight: '500',
        padding: '12px 20px',
        borderRadius: '8px',
      },
      icon: '⚠️',
    });
  },

  /**
   * Show loading notification
   */
  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-center',
      style: {
        background: '#6B7280',
        color: '#fff',
        fontWeight: '500',
        padding: '12px 20px',
        borderRadius: '8px',
      },
    });
  },

  /**
   * Dismiss a notification by ID
   */
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Dismiss all notifications
   */
  dismissAll: () => {
    toast.dismiss();
  },
};
