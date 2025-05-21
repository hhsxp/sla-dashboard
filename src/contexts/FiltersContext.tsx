import React, { createContext, useContext, useReducer } from 'react';
import { Ticket } from '../types';

interface Filters {
  dateFrom?: Date;
  dateTo?: Date;
  projetos: string[];
  unidades: string[];
  analistas: string[];
  page: number;
  pageSize: number;
}

type Action =
  | { type: 'SET_DATE_FROM'; payload?: Date }
  | { type: 'SET_DATE_TO'; payload?: Date }
  | { type: 'SET_PROJETOS'; payload: string[] }
  | { type: 'SET_UNIDADES'; payload: string[] }
  | { type: 'SET_ANALISTAS'; payload: string[] }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_PAGE_SIZE'; payload: number };

const initialState: Filters = { projetos: [], unidades: [], analistas: [], page: 1, pageSize: 10 };

function reducer(state: Filters, action: Action): Filters {
  switch (action.type) {
    case 'SET_DATE_FROM': return { ...state, dateFrom: action.payload };
    case 'SET_DATE_TO':   return { ...state, dateTo: action.payload };
    case 'SET_PROJETOS':  return { ...state, projetos: action.payload };
    case 'SET_UNIDADES':  return { ...state, unidades: action.payload };
    case 'SET_ANALISTAS': return { ...state, analistas: action.payload };
    case 'SET_PAGE':      return { ...state, page: action.payload };
    case 'SET_PAGE_SIZE': return { ...state, pageSize: action.payload };
    default: return state;
  }
}

const FiltersContext = createContext<{ filters: Filters; dispatch: React.Dispatch<Action> }>({ filters: initialState, dispatch: () => {} });
export const FiltersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, dispatch] = useReducer(reducer, initialState);
  return <FiltersContext.Provider value={{ filters, dispatch }}>{children}</FiltersContext.Provider>;
};
export function useFilters() { return useContext(FiltersContext); }
