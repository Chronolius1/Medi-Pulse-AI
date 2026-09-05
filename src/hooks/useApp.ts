import { useContext } from 'react';
import { AppDispatchContext, AppStateContext } from '../state/appContext';

export const useAppState = () => useContext(AppStateContext);
export const useAppDispatch = () => useContext(AppDispatchContext);
