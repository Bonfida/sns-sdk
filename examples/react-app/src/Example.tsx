import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  useDomainOwner,
  useDomainsForOwner,
  useSearch,
  useDomainSuggestions,
  useTopDomainsSales,
} from "@bonfida/sns-react";
import { useState } from "react";

export const Example = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const bonfidaOwner = useDomainOwner(connection, "bonfida");
  const domains = useDomainsForOwner(connection, publicKey);

  const [searchInput, updateSearchInput] = useState("");
  const [searchQuery, updateSearchQuery] = useState("");
  const searchResult = useSearch({
    connection,
    domain: searchQuery,
    options: { queryKey: ["useSearch", searchQuery] },
  });

  const domainSuggestions = useDomainSuggestions(connection, searchQuery);

  const topDomainsSales = useTopDomainsSales();

  return (
    <div className="flex flex-col h-full gap-3 px-10">
      <div className="flex space-x-4 text-white">
        <p>Owner of bonfida.sol: </p>{" "}
        <p className="font-medium">{bonfidaOwner.data?.toBase58()}</p>
      </div>
      <div className="text-white">
        <p>Your domains:</p>
        {domains?.data?.map((e) => {
          return (
            <p key={e.pubkey.toBase58()}>
              - {e.domain}.sol ({e.pubkey.toBase58()})
            </p>
          );
        })}
      </div>

      <div className="text-white">
        <p>Search for domain availability and suggestions:</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            updateSearchQuery(searchInput);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={searchInput}
            placeholder="Enter domain"
            className="text-black"
            onChange={(e) => updateSearchInput(e.target.value)}
          />
          <button>Submit</button>
        </form>
        <div className="py-2">
          {searchResult.isLoading && "Loading..."}
          {searchResult.data?.map((e) => {
            return (
              <p key={e.domain}>
                Domain name: {e.domain}
                <br></br>
                Is available: {String(e.available)}
              </p>
            );
          })}
        </div>
        <hr></hr>
        <p>Domain suggestions:</p>
        {domainSuggestions.isLoading && "Loading..."}
        <table>
          <thead>
            <tr>
              <td>Domain name</td>
              <td>Available?</td>
            </tr>
          </thead>
          <tbody>
            {domainSuggestions.data?.map((e) => {
              return (
                <tr key={e.domain}>
                  <td>{e.domain}</td>
                  <td>{String(e.available)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-white">
        <p>Top sales:</p>

        <table>
          <thead>
            <tr>
              <td>Domain name</td>
              <td>Price, $</td>
            </tr>
          </thead>
          <tbody>
            {topDomainsSales.data?.map((e) => {
              return (
                <tr key={e.domain}>
                  <td>{e.domain}.sol</td>
                  <td>${e.price}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
