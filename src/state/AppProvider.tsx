import { useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { AppDispatchContext, AppStateContext } from './appContext';
import { appReducer, initialState } from './appReducer';
import { loadPersistedState, persistState } from './persistence';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Hydrate once on mount. Nothing is written to storage before this completes.
  useEffect(() => {
    dispatch({ type: 'hydrate', payload: loadPersistedState() });
  }, []);

  // Persist on change, debounced so a burst of edits writes once.
  useEffect(() => {
    if (!state.hydrated) return;
    const timer = window.setTimeout(() => {
      persistState({
        records: state.records,
        settings: state.settings,
        customDoctors: state.doctors.custom,
        location: state.doctors.location,
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [
    state.hydrated,
    state.records,
    state.settings,
    state.doctors.custom,
    state.doctors.location,
  ]);

  const dispatchValue = useMemo(() => dispatch, []);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatchValue}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}
