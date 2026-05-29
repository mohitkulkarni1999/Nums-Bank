import toast from 'react-hot-toast';

export const Toast = {
  success: (message) => {
    toast.success(message, {
      style: {
        border: '1px solid #FFD700',
        padding: '16px',
        color: '#1e293b',
        background: '#fffbeb',
        fontWeight: '600',
      },
      iconTheme: {
        primary: '#ca8a04',
        secondary: '#fffbeb',
      },
    });
  },
  error: (message) => {
    toast.error(message, {
      style: {
        border: '1px solid #ef4444',
        padding: '16px',
        color: '#ffffff',
        background: '#7f1d1d',
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: '#7f1d1d',
      },
    });
  },
  loading: (message) => {
    return toast.loading(message, {
      style: {
        border: '1px solid #FFD700',
        padding: '16px',
        color: '#1e293b',
        background: '#fffbeb',
        fontWeight: '600',
      },
    });
  },
};
export default Toast;
