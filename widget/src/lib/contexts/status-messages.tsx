import { type ReactNode, createContext, useState } from "react";

export interface GlobalStatus {
  status: "success" | "error";
  message: string;
}

export interface CartContextValue {
  status: GlobalStatus | null;
  setStatus: (status: GlobalStatus | null) => void;
  setError: (message: string) => void;
}

export const GlobalStatusContext = createContext<CartContextValue>({
  status: null,
  setStatus: () => {},
  setError: () => {},
});

export const GlobalStatusContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [status, setStatus] = useState<GlobalStatus | null>(null);

  const setError = (message: string) => {
    setStatus({
      status: "error",
      message,
    });
  };

  return (
    <GlobalStatusContext.Provider
      value={{
        status,
        setStatus,
        setError,
      }}
    >
      {children}
    </GlobalStatusContext.Provider>
  );
};
