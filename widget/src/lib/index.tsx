import { FormEvent, useState } from "react";
import { InputField } from "./components/input-field";
import { SearchShort, SafeBoxStar } from "react-huge-icons/outline";
import { twMerge } from "tailwind-merge";

type Views = "home" | "search" | "cart";

export const WidgetRoot = () => {
  const [currentView, setCurrentView] = useState<Views>("home");
  const [finished, finish] = useState(false);

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCurrentView("search");
  };

  const isSearchView = currentView === "search";

  return (
    <div className="flex flex-col min-h-[560px] w-[400px] bg-bg-primary p-3">
      <header>Connect wallet</header>

      <div className="flex flex-col flex-grow">
        <div
          className={twMerge(
            "translate-y-[80px] transition-all duration-700",
            isSearchView && "-translate-y-[22px]",
          )}
        >
          <h1
            className={twMerge(
              "block max-h-[32px] text-2xl font-medium text-center font-primary transition-all ease-out duration-200",
              isSearchView && "opacity-0 invisible",
              finished && "max-h-0",
            )}
            onTransitionEnd={() => finish(true)}
          >
            Secure a custom domain
          </h1>

          <form className="flex gap-2 mt-10" onSubmit={search}>
            <InputField placeholder="Search your domain" className="" />

            <button
              className="
              rounded-[10px] bg-theme-primary h-[56px] w-[56px] p-2
              flex items-center justify-center
            "
            >
              <SearchShort width={24} height={24} />
            </button>
          </form>
        </div>

        <div
          className="
            flex items-center mt-auto gap-2.5
            bg-bg-tertiary
            rounded-[10px] py-4 px-2.5
            font-primary
          "
        >
          <SafeBoxStar width={24} height={24} />
          Solana mobile referral gives you 15% off
        </div>
      </div>

      {/* <div className="w-f">
        <div className="field"></div>

        <div className="list">
          <div className="item"></div>
        </div>
        <div className="button"></div>
      </div>

      <div className="cart">
        <div className="cart-steps-header"></div>

        <div className="step-1">
          <div className="list">
            <div className="item">
              <div className="name"></div>
              <div className="storage"></div>
              <div className="remove"></div>
            </div>
          </div>
          <div className="button"></div>
        </div>

        <div className="step-2">
          <div className="pay-with"></div>
          <div className="order-summary"></div>
          <div className="order-processing"></div>
          <div className="button"></div>
        </div>

        <div className="step-3">
          <div className="order-result"></div>
          <div className="button"></div>
        </div>
      </div> */}

      <div className="powered-by">Powered by Bonfida</div>
    </div>
  );
};
