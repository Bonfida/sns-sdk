import { abbreviate } from "../utils";
import type { ReactNode } from "react";

export const DomainCardBase = ({
  domain,
  available = false,
  price,
  children,
}: {
  domain: string;
  available?: boolean;
  price?: number | string;
  children: ReactNode;
}) => {
  return (
    <div className="flex flex-row items-center gap-4 px-4 py-3 shadow-domain rounded-xl bg-background-secondary min-h-[72px]">
      <div className="flex flex-col mr-auto">
        <span className="text-base text-content-secondary font-primary">
          {abbreviate(`${domain}.sol`, 25, 3)}
        </span>
        {available && <span className="text-sm font-medium">{price}</span>}
      </div>

      {children}
    </div>
  );
};
