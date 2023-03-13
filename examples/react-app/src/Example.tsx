import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useDomainOwner, useDomainsForOwner } from "@bonfida/sns-react";

export const Example = () => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const bonfidaOwner = useDomainOwner(connection, "bonfida");
  const domains = useDomainsForOwner(connection, publicKey);

  return (
    <div className="flex flex-col px-10 h-full">
      <div className="flex space-x-4">
        <p>Owner of bonfida.sol: </p>{" "}
        <p className="font-medium">{bonfidaOwner.result?.toBase58()}</p>
      </div>
      <div>
        <p>Your domains:</p>
        {domains?.result?.map((e) => {
          return (
            <p key={e.pubkey.toBase58()} className="">
              - {e.domain}.sol ({e.pubkey.toBase58()})
            </p>
          );
        })}
      </div>
    </div>
  );
};
