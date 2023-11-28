import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useDomainOwner, useDomainsForOwner } from "@bonfida/sns-react";

export const Example = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const bonfidaOwner = useDomainOwner(connection, "bonfida");
  const domains = useDomainsForOwner(connection, publicKey);

  return (
    <div className="flex flex-col h-full px-10">
      <div className="flex space-x-4 text-white">
        <p>Owner of bonfida.sol: </p>{" "}
        <p className="font-medium">{bonfidaOwner.result?.toBase58()}</p>
      </div>
      <div className="text-white">
        <p>Your domains:</p>
        {domains?.result?.map((e) => {
          return (
            <p key={e.pubkey.toBase58()}>
              - {e.domain}.sol ({e.pubkey.toBase58()})
            </p>
          );
        })}
      </div>
    </div>
  );
};
