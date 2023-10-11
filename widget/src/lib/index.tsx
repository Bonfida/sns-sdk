import { type FormEvent, useState, useContext } from "react";
import { InputField } from "./components/input-field";
import {
  SearchShort,
  SafeBoxStar,
  WalletClose,
} from "react-huge-icons/outline";
import { twMerge } from "tailwind-merge";
import { CartContext, CartContextProvider } from "./contexts/cart";
import { DomainSearchResultRow } from "./components/domain-search-result-row";
import { CustomButton } from "./components/button";
import { FidaLogo } from "./components/fida-logo";
import { CartView } from "./cart-view";
import { useSearch } from "./hooks/useSearch";
import { useDomainSuggestions } from "./hooks/useDomainSuggestions";

export const WidgetRoot = () => {
  return (
    <CartContextProvider>
      <WidgetHome />
    </CartContextProvider>
  );
};

type Views = "home" | "search" | "cart";

const WidgetHome = () => {
  const [currentView, setCurrentView] = useState<Views>("home");
  const [finished, finish] = useState(false);
  const [searchInput, updateSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { isCartEmpty } = useContext(CartContext);
  const domains = useSearch(searchQuery);
  const suggestions = useDomainSuggestions(searchQuery);

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCurrentView("search");
    setSearchQuery(searchInput);
  };

  const isHomeView = currentView === "home";
  const isSearchView = currentView === "search";
  const isCartView = currentView === "cart";

  return (
    <div className="flex flex-col h-[560px] w-[400px] bg-background-primary relative">
      <div className="px-3 pt-3">
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 ml-auto text-xs tracking-wide rounded-lg bg-theme-secondary font-primary text-theme-primary"
        >
          <WalletClose width={16} height={16} />
          Connect wallet
        </button>
      </div>

      <div className="flex flex-col flex-grow overflow-auto">
        {(isHomeView || isSearchView) && (
          <>
            <div
              className={twMerge(
                "translate-y-[80px] transition-all duration-700 px-3",
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
                <InputField
                  value={searchInput}
                  placeholder="Search your domain"
                  className="shadow-3xl"
                  type="search"
                  onChange={(e) => updateSearchInput(e.target.value)}
                />

                <button
                  className="
                    rounded-[10px] bg-theme-primary h-[56px] w-[56px] p-2
                    flex items-center justify-center text-background-primary
                  "
                >
                  <SearchShort width={24} height={24} />
                </button>
              </form>
            </div>

            {isSearchView && (
              <>
                <div className="px-3 mb-3 overflow-auto animate-fade-in">
                  {domains.result?.map((domain) => (
                    <DomainSearchResultRow
                      key={domain.domain}
                      domain={domain.domain}
                      available={domain.available}
                    />
                  ))}

                  <div className="mt-4">
                    <p className="mb-2 ml-4 text-sm text-text-secondary font-primary">
                      You might also like
                    </p>

                    <div className="flex flex-col gap-2">
                      {suggestions.result?.map((domain) => (
                        <DomainSearchResultRow
                          key={domain.domain}
                          domain={domain.domain}
                          available={domain.available}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {!isCartEmpty && (
                  <CustomButton
                    className="absolute left-3 right-3 bottom-4 text-[#fff]"
                    onClick={() => setCurrentView("cart")}
                  >
                    Go to cart
                  </CustomButton>
                )}
              </>
            )}
          </>
        )}

        {isCartView && (
          <CartView backHandler={() => setCurrentView("search")} />
        )}

        {isHomeView && (
          <div
            className="
              flex items-center mt-auto gap-2.5
              bg-background-tertiary
              text-theme-primary
              rounded-[10px] py-4 px-2.5
              font-primary
              mx-3 mb-3
            "
          >
            <SafeBoxStar width={24} height={24} />
            Solana mobile referral gives you 15% off
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-center text-[#000000]">
          Powered by
          <span className="h-[20px]">
            <FidaLogo />
          </span>
        </div>
      </div>
    </div>
  );
};
