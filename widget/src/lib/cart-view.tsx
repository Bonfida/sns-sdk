import { useState, useContext } from "react";
import { ArrowLeft } from "react-huge-icons/outline";
import { twMerge } from "tailwind-merge";
import { DomainCartItem } from "./components/domain-cart-item";
import { CartContext } from "./contexts/cart";

type Step = 1 | 2 | 3;

interface CartViewProps {
  backHandler: () => void;
}

export const CartView = ({ backHandler }: CartViewProps) => {
  const [step, setStep] = useState<Step>(1);
  const { cart } = useContext(CartContext);

  const progressWidth: Record<Step, string> = {
    1: "w-[33%]",
    2: "w-[66%]",
    3: "w-full",
  };

  return (
    <div>
      <div className="sticky -top-1 bg-background-primary h-[48px] flex justify-center items-center px-3">
        <button
          type="button"
          onClick={() => backHandler()}
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
        {step === 1 && (
          <>
            <p className="px-3 mb-2 ml-4 text-sm text-text-secondary font-primary">
              You are registering
            </p>

            <div className="flex flex-col gap-2 px-3 pb-4">
              {Object.values(cart).map((item) => (
                <DomainCartItem domain={item.domain} />
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <div className="step-2">Pay with Select field Order summary</div>
        )}
        {step === 3 && <div className="step-3">Final stage</div>}
      </div>
      <div className="footer"></div>
    </div>
  );
};
