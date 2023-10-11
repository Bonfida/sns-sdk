import { useAsync } from "react-async-hook";

const URL = "https://sns-api.bonfida.com/sales/top";

interface SearchResponseEntity {
  domain_name: string;
  domain_key: string;
  price: number;
  tx_signature: string;
  usd_price: number;
  // ... and a bunch of other fields
}

export const useTopDomainsSales = (allowedToLoad: boolean = true) => {
  const fn = async () => {
    if (!allowedToLoad) return;

    const startTime = new Date();
    startTime.setMonth(startTime.getMonth() - 1);

    const searchParams = new URLSearchParams({
      start_time: String(Math.floor(startTime.getTime() / 1000)),
      end_time: String(Math.floor(new Date().getTime() / 1000)),
      limit: "10",
    });

    const {
      data: { result },
    }: { data: { result: SearchResponseEntity[] } } = await (
      await fetch(`${URL}?${searchParams.toString()}`, { method: "GET" })
    ).json();

    // All domains returned by the API are available
    return (result || []).map((item) => ({
      domain: item.domain_name,
      price: item.usd_price.toLocaleString("en-US", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }),
    }));
  };

  return useAsync(fn, []);
};
