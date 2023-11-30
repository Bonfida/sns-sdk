import { MaybeRef, unref } from "vue";
import { useLoadingFactory } from "@/utils";

const URL = "https://sns-api.bonfida.com/sales/top";

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
 * @param {number} params.limit - Amount of data to load
 * @returns {Promise<{ domain: string; price: string }[]>} Array of records with domain name and its formatted price
 *
 * @example
 * // Example usage
 * const { result: topSales } = await useTopDomainsSales();
 */
export const useTopDomainsSales = ({
  isEnabled = true,
  startTime = getDefaultStartTime(),
  endTime = new Date(),
  limit = 10,
}: {
  isEnabled?: MaybeRef<boolean>;
  startTime?: MaybeRef<Date>;
  endTime?: MaybeRef<Date>;
  limit?: MaybeRef<number>;
} = {}) => {
  return useLoadingFactory<{ domain: string; price: string }[] | undefined>(
    async () => {
      if (!unref(isEnabled)) return undefined;

      const searchParams = new URLSearchParams({
        start_time: String(Math.floor(unref(startTime).getTime() / 1000)),
        end_time: String(Math.floor(unref(endTime).getTime() / 1000)),
        limit: String(unref(limit)),
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
    },
    () => [unref(startTime), unref(endTime), unref(limit)],
  );
};
