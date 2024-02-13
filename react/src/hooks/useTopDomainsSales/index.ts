import { useRef } from "react";
import { Options } from "../../types";
import { useQuery } from "@tanstack/react-query";

const URL = "https://sns-api.bonfida.com/sales/top";

type Result = {
  domain: string;
  price: string;
};

interface SearchResponseEntity {
  domain_name: string;
  domain_key: string;
  price: number;
  tx_signature: string;
  usd_price: number;
  // ... and a bunch of other fields
}

const getDefaultStartTime = () => {
  const startTime = new Date();
  // 1 month before current date
  startTime.setMonth(startTime.getMonth() - 1);
  return startTime;
};

/**
 * Asynchronously loads top domains sales for a specified period (by default
 * last month). Be aware that API has a rate limiter.
 *
 * @param {boolean} params.isEnabled - Enable/disable loading
 * @param {Date} params.startTime - Date period start
 * @param {Date} params.endTime - Date period end
 * @param {number} params.limit – Amount of data to load
 * @returns {Promise<{ domain: string; price: string }[]>} - Array of records with domain name and its formatted price
 *
 * @example
 * // Example usage
 * const topSales = await useTopDomainsSales();
 */
export const useTopDomainsSales = (
  {
    startTime,
    endTime,
    limit = 10,
    options,
  }: {
    startTime?: Date;
    endTime?: Date;
    limit?: number;
    options: Options<Result[]>;
  } = { options: { queryKey: ["useTopDomainsSales"] } },
) => {
  const defaultStartTime = useRef(getDefaultStartTime());
  const defaultEndTime = useRef(new Date());

  const effectiveStartTime = startTime || defaultStartTime.current;
  const effectiveEndTime = endTime || defaultEndTime.current;

  const fn = async () => {
    const searchParams = new URLSearchParams({
      start_time: String(Math.floor(effectiveStartTime.getTime() / 1000)),
      end_time: String(Math.floor(effectiveEndTime.getTime() / 1000)),
      limit: String(limit),
    });

    const data: { result: SearchResponseEntity[] } = await (
      await fetch(`${URL}?${searchParams.toString()}`)
    ).json();

    return (data?.result || []).map((item) => ({
      domain: item.domain_name,
      price: item.usd_price.toLocaleString("en-US", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }),
    }));
  };

  return useQuery({ ...options, queryFn: fn });
};
