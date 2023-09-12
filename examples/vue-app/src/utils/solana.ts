import { Connection } from '@solana/web3.js';

const commitment = 'confirmed';

let solanaUtils: {
  connection: Connection | null;
} = {
  connection: null,
};

export const useSolanaConnection = () => solanaUtils.connection;

export const initSolanaConnection = () => {
  const connection = new Connection(
    'https://helius-proxy.bonfida.com',
    commitment,
  );

  solanaUtils = {
    connection,
  };
};
