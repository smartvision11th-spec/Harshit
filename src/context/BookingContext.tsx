import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type BookingContextValue = {
  /** Service id preselected from the services section (empty = none). */
  service: string;
  setService: (id: string) => void;
};

const BookingContext = createContext<BookingContextValue>({ service: '', setService: () => undefined });

export const useBooking = () => useContext(BookingContext);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [service, setService] = useState('');
  const value = useMemo(() => ({ service, setService }), [service]);
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
