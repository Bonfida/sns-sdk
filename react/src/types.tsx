import { type UseQueryOptions } from "@tanstack/react-query";

export type Options<TData = unknown, TError = unknown> = Omit<
  UseQueryOptions<TData, TError, TData, any[]>,
  "queryFn"
>;
