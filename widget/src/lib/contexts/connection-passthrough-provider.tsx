import { Connection } from "@solana/web3.js";
import { createContext, PropsWithChildren, ReactNode, useContext } from "react";
import { useConnection } from "@solana/wallet-adapter-react";

interface ConnectionPassThroughStructure {
  connection: Connection | null;
}

export const ConnectionPassthroughContext =
  createContext<ConnectionPassThroughStructure>({ connection: null });

export function useConnectionPassThrough(): ConnectionPassThroughStructure {
  return useContext(ConnectionPassthroughContext);
}

const FromConnectionProvider = ({ children }: PropsWithChildren) => {
  const { connection } = useConnection();

  return (
    <ConnectionPassthroughContext.Provider value={{ connection }}>
      {children}
    </ConnectionPassthroughContext.Provider>
  );
};

interface ConnectionPassthroughProviderProps {
  children: ReactNode;
  connection?: Connection;
}

export const ConnectionPassthroughProvider = ({
  children,
  connection,
}: ConnectionPassthroughProviderProps) => {
  if (!connection) {
    return <FromConnectionProvider>{children}</FromConnectionProvider>;
  }

  if (connection) {
    return (
      <ConnectionPassthroughContext.Provider value={{ connection }}>
        {children}
      </ConnectionPassthroughContext.Provider>
    );
  }

  return <>{children}</>;
};
