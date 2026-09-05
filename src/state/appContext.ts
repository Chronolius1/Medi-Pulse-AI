import { createContext, type Dispatch } from 'react';
import { initialState } from './appReducer';
import type { Action, AppState } from './types';

/**
 * State and dispatch live in separate contexts so that dispatch-only consumers
 * (every button in the app) don't re-render when unrelated state changes.
 */
export const AppStateContext = createContext<AppState>(initialState);
export const AppDispatchContext = createContext<Dispatch<Action>>(() => undefined);
