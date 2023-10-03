import { useState } from "react";
import { ArrowLeft } from "react-huge-icons/outline";
import { twMerge } from "tailwind-merge";
import { DomainSearchResultRow } from "./components/domain-search-result-row";

type Step = 0 | 1 | 2;

export const CartView = () => {
  const [step, setStep] = useState<Step>(0);

  const progressWidth: Record<Step, string> = {
    0: "w-[33%]",
    1: "w-[66%]",
    2: "w-full",
  };

  return (
    <div>
      <div className="relative h-[48px] flex justify-center items-center px-3">
        <button
          type="button"
          className="absolute top-0 p-3 border-0 left-3 text-theme-primary"
        >
          <ArrowLeft width={24} height={24} />
        </button>

        <div className="w-[175px] h-[5px] rounded-md bg-[#eff3f4] bg-gradient-to-r">
          <div
            className={twMerge(
              "bg-theme-primary h-full rounded-md transition-[width] duration-500",
              progressWidth[step],
            )}
          ></div>
        </div>
      </div>
      <div className="pt-6 body">
        <div className="step-1">
          <p className="mb-2 ml-4 text-sm text-text-secondary">
            You are registering
          </p>

          <DomainSearchResultRow domain="designonline" available price={20} />
        </div>
        <div className="step-2">Pay with Select field Order summary</div>
        <div className="step-3">Final stage</div>
      </div>
      <div className="footer"></div>
    </div>
  );
};
