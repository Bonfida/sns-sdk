import { useState, useContext } from "react";
import { ArrowLeft, Warning } from "react-huge-icons/outline";
import { twMerge } from "tailwind-merge";
import { DomainCartItem } from "./components/domain-cart-item";
import { CartContext } from "./contexts/cart";
import { CustomButton } from "./components/button";

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

  const goBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      backHandler();
    }
  };

  const processStep = () => {
    if (step === 3) {
      backHandler();
    } else {
      setStep((step + 1) as Step);
    }
  };

  return (
    <div className="flex flex-col flex-grow">
      <div className="sticky -top-1 bg-background-primary h-[48px] flex justify-center items-center px-3">
        <button
          type="button"
          onClick={() => goBack()}
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
      <div className="flex flex-col flex-grow pt-6 body">
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
          <div className="flex flex-col flex-grow pb-[56px] px-3">
            <div className="mb-auto">
              <p className="mb-3 ml-4 font-medium font-primary">Pay with</p>
              <div>Select field</div>
            </div>

            <div>
              <p className="mb-3 font-medium font-primary">Order summary</p>
              <div className="flex mb-2 justify-between items-start text-sm font-medium leading-6 border-b border-[#F1EEFF]">
                <div>Total</div>
                <div className="flex flex-col items-end">
                  <span>16 USDC</span>
                  <span className="text-xs leading-6 text-[#797A93]">
                    $15.88
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-start text-sm font-medium leading-6 border-b border-[#F1EEFF]">
                <div>Discount</div>
                <div>20%</div>
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="step-3">
            Final stage
            <Warning />
          </div>
        )}
      </div>
      <div className="footer">
        <CustomButton
          className="absolute left-3 right-3 bottom-4 text-[#fff]"
          onClick={() => processStep()}
        >
          {step === 1 && "Continue to payment"}
          {step === 2 && "Confirm and register"}
          {step === 3 && "Done"}
        </CustomButton>
      </div>
    </div>
  );
};
