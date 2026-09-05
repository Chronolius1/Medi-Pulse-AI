import { useContext } from 'react';
import { ToastContext } from '../components/ui/toastContext';

export const useToast = () => useContext(ToastContext);
