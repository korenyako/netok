import { toast } from 'sonner';

/**
 * Notification utilities for user feedback
 */
export const notifications = {
  success: (message: string) => {
    toast.success(message);
  },

  error: (message: string) => {
    toast.error(message);
  },

  info: (message: string) => {
    toast.info(message);
  },

  warn: (message: string) => {
    toast.warning(message);
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId);
  },

  dismissAll: () => {
    toast.dismiss();
  },
};
