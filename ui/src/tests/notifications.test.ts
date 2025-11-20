import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notifications } from '../utils/notifications';
import toast from 'react-hot-toast';

// Mock react-hot-toast
vi.mock('react-hot-toast');

describe('notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('success', () => {
    it('should call toast.success with correct message', () => {
      const message = 'Operation successful';
      notifications.success(message);

      expect(toast.success).toHaveBeenCalledWith(
        message,
        expect.objectContaining({
          duration: 4000,
          position: 'top-center',
        })
      );
    });

    it('should use green color for success notifications', () => {
      notifications.success('Test');

      expect(toast.success).toHaveBeenCalledWith(
        'Test',
        expect.objectContaining({
          style: expect.objectContaining({
            background: '#3CB57F',
            color: '#fff',
          }),
        })
      );
    });
  });

  describe('error', () => {
    it('should call toast.error with correct message', () => {
      const message = 'Operation failed';
      notifications.error(message);

      expect(toast.error).toHaveBeenCalledWith(
        message,
        expect.objectContaining({
          duration: 6000,
          position: 'top-center',
        })
      );
    });

    it('should use red color for error notifications', () => {
      notifications.error('Test error');

      expect(toast.error).toHaveBeenCalledWith(
        'Test error',
        expect.objectContaining({
          style: expect.objectContaining({
            background: '#EF4444',
            color: '#fff',
          }),
        })
      );
    });

    it('should have longer duration than success', () => {
      notifications.error('Error');

      const errorCall = vi.mocked(toast.error).mock.calls[0];
      expect(errorCall[1]?.duration).toBe(6000);
    });
  });

  describe('info', () => {
    it('should call toast with info message', () => {
      const message = 'Information';
      notifications.info(message);

      expect(toast).toHaveBeenCalledWith(
        message,
        expect.objectContaining({
          duration: 4000,
          position: 'top-center',
        })
      );
    });

    it('should use blue color for info notifications', () => {
      notifications.info('Info');

      expect(toast).toHaveBeenCalledWith(
        'Info',
        expect.objectContaining({
          style: expect.objectContaining({
            background: '#3B82F6',
          }),
        })
      );
    });
  });

  describe('warn', () => {
    it('should call toast with warning message', () => {
      const message = 'Warning';
      notifications.warn(message);

      expect(toast).toHaveBeenCalledWith(
        message,
        expect.objectContaining({
          duration: 5000,
        })
      );
    });

    it('should use amber color for warnings', () => {
      notifications.warn('Warning');

      expect(toast).toHaveBeenCalledWith(
        'Warning',
        expect.objectContaining({
          style: expect.objectContaining({
            background: '#F59E0B',
          }),
        })
      );
    });
  });

  describe('loading', () => {
    it('should call toast.loading with message', () => {
      const message = 'Loading...';
      notifications.loading(message);

      expect(toast.loading).toHaveBeenCalledWith(
        message,
        expect.objectContaining({
          position: 'top-center',
        })
      );
    });
  });

  describe('dismiss', () => {
    it('should call toast.dismiss with id', () => {
      const toastId = 'test-id';
      notifications.dismiss(toastId);

      expect(toast.dismiss).toHaveBeenCalledWith(toastId);
    });
  });

  describe('dismissAll', () => {
    it('should call toast.dismiss without arguments', () => {
      notifications.dismissAll();

      expect(toast.dismiss).toHaveBeenCalledWith();
    });
  });
});
