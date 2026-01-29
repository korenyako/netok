import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notifications } from '../utils/notifications';
import { toast } from 'sonner';

// Mock sonner
vi.mock('sonner', () => ({
  toast: Object.assign(
    vi.fn(),
    {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
      loading: vi.fn(),
      dismiss: vi.fn(),
    }
  ),
}));

describe('notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('success', () => {
    it('should call toast.success with correct message', () => {
      notifications.success('Operation successful');
      expect(toast.success).toHaveBeenCalledWith('Operation successful');
    });
  });

  describe('error', () => {
    it('should call toast.error with correct message', () => {
      notifications.error('Operation failed');
      expect(toast.error).toHaveBeenCalledWith('Operation failed');
    });
  });

  describe('info', () => {
    it('should call toast.info with message', () => {
      notifications.info('Information');
      expect(toast.info).toHaveBeenCalledWith('Information');
    });
  });

  describe('warn', () => {
    it('should call toast.warning with message', () => {
      notifications.warn('Warning');
      expect(toast.warning).toHaveBeenCalledWith('Warning');
    });
  });

  describe('loading', () => {
    it('should call toast.loading with message', () => {
      notifications.loading('Loading...');
      expect(toast.loading).toHaveBeenCalledWith('Loading...');
    });
  });

  describe('dismiss', () => {
    it('should call toast.dismiss with id', () => {
      notifications.dismiss('test-id');
      expect(toast.dismiss).toHaveBeenCalledWith('test-id');
    });
  });

  describe('dismissAll', () => {
    it('should call toast.dismiss without arguments', () => {
      notifications.dismissAll();
      expect(toast.dismiss).toHaveBeenCalledWith();
    });
  });
});
