import { useState, useContext, useEffect } from "react";
import { ArrowLeft, Warning, WalletClose } from "react-huge-icons/outline";
import { twMerge } from "tailwind-merge";
import { DomainCartItem } from "./components/domain-cart-item";
import { CartContext } from "./contexts/cart";
import { CustomButton } from "./components/button";
import { BaseModal } from "./components/modal";
import { tokenList, FIDA_MINT, priceFromLength } from "./utils";

type Step = 1 | 2 | 3;

interface CartViewProps {
  backHandler: () => void;
}

export const CartView = ({ backHandler }: CartViewProps) => {
  const [step, setStep] = useState<Step>(1);
  const { cart } = useContext(CartContext);
  const [selectedToken, selectToken] = useState(tokenList[0]);
  const [isTokenSelectorOpen, toggleTokenSelector] = useState(false);
  const [isStorageSelectorOpen, toggleStorageSelector] = useState(false);

  const discountMul = selectedToken.mintAddress === FIDA_MINT ? 0.95 : 1;
  const totalUsd = Object.values(cart).reduce(
    (acc, v) => acc + priceFromLength(v.domain, discountMul),
    0,
  );

  useEffect(() => {
    if (!Object.keys(cart).length) {
      backHandler();
    }
  }, [cart, backHandler]);

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
                <DomainCartItem
                  key={item.domain}
                  domain={item.domain}
                  onEdit={() => toggleStorageSelector(true)}
                />
              ))}
            </div>

            <BaseModal
              isVisible={isStorageSelectorOpen}
              toggleVisibility={toggleStorageSelector}
            >
              <div className="w-[320px] bg-background-primary flex flex-col gap-3 py-3 rounded-xl">
                Selector
              </div>
            </BaseModal>
          </>
        )}
        {step === 2 && (
          <div className="flex flex-col flex-grow pb-[56px] px-3">
            <div className="mb-auto">
              <p className="mb-3 ml-4 font-medium font-primary">Pay with</p>
              <div>
                <button
                  type="button"
                  className="flex w-full items-center gap-4 p-4 border rounded-xl border-[#F3F4F5] bg-[#F6F9FA] cursor-pointer"
                  onClick={() => toggleTokenSelector(!isTokenSelectorOpen)}
                >
                  <img
                    className="w-4 h-4 rounded-[50%]"
                    src={selectedToken.icon}
                    alt={selectedToken.tokenSymbol}
                  />
                  <span className="tracking-wide text-text-primary">
                    {selectedToken.tokenSymbol}
                  </span>
                  <div className="relative w-[25px] h-[25px] flex justify-center items-center ml-auto">
                    <div
                      className={twMerge(
                        "transition-transform duration-200 absolute w-[8px] h-[2px] bg-theme-primary rounded-sm -rotate-[45deg] ml-[5px]",
                        isTokenSelectorOpen && "rotate-[45deg]",
                      )}
                    ></div>
                    <div
                      className={twMerge(
                        "transition-transform duration-200 absolute w-[8px] h-[2px] bg-theme-primary rounded-sm rotate-[45deg] -ml-[4px]",
                        isTokenSelectorOpen && "-rotate-[45deg]",
                      )}
                    ></div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <p className="mb-3 font-medium font-primary">Order summary</p>
              <div className="flex mb-2 justify-between items-start text-sm font-medium leading-6 border-b border-[#F1EEFF]">
                <div>Total</div>
                <div className="flex flex-col items-end">
                  <span>{totalUsd} USDC</span>
                  <span className="text-xs leading-6 text-[#797A93]">
                    ${totalUsd}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-start text-sm font-medium leading-6 border-b border-[#F1EEFF]">
                <div>Discount</div>
                <div>20%</div>
              </div>
            </div>

            <BaseModal
              isVisible={isTokenSelectorOpen}
              toggleVisibility={toggleTokenSelector}
            >
              <div className="w-[320px] bg-background-primary flex flex-col gap-3 py-3 rounded-xl">
                {tokenList.map((item) => (
                  <button
                    key={item.tokenSymbol}
                    type="button"
                    className={twMerge(
                      "flex items-center gap-3 px-3 py-1 max-w duration-200 cursor-pointer",
                      "font-primary hover:bg-background-tertiary transition-[background-color]",
                    )}
                    onClick={() => {
                      selectToken(item);
                      toggleTokenSelector(false);
                    }}
                  >
                    <img
                      src={item.icon}
                      alt={item.tokenSymbol}
                      className="w-6 h-6 rounded-[50%]"
                    />
                    <div className="flex flex-col items-start">
                      <span>{item.tokenSymbol}</span>
                      <span className="flex text-xs text-text-secondary gap-0.5 items-center">
                        <WalletClose width={14} height={14} />
                        1,000
                      </span>
                    </div>
                    <div className="flex flex-col ml-auto text-sm">
                      <span>160.45 FIDA</span>
                      <span>
                        {item.mintAddress === FIDA_MINT && "155.45 FIDA"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </BaseModal>
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
