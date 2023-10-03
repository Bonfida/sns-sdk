import { abbreviate } from "../utils";
import { twMerge } from "tailwind-merge";
import { ShoppingBasketHorizontal, Tick } from "react-huge-icons/outline";
import { useContext } from "react";
import { CartContext } from "../contexts/cart";

export const DomainSearchResultRow = ({
  domain,
  available = false,
  price,
}: {
  domain: string;
  available?: boolean;
  price?: number | string;
}) => {
  const { cart, addToCart, removeFromCart } = useContext(CartContext);

  const isInCart = Boolean(cart[domain]);

  return (
    <div className="flex flex-row items-center gap-4 px-4 py-3 shadow-domain rounded-xl bg-background-secondary min-h-[72px]">
      <div className="flex flex-col mr-auto">
        <span className="text-base text-content-secondary font-primary">
          {abbreviate(`${domain}.sol`, 25, 3)}
        </span>
        {available && <span className="text-sm font-medium">{price}</span>}
      </div>
      {!available && (
        <div className="px-3 rounded-lg bg-accent bg-opacity-10">
          <span className="text-xs font-semibold leading-6 tracking-widest text-accent">
            Registered
          </span>
        </div>
      )}
      {available && (
        <div
          className={twMerge(
            "flex items-center flex-row justify-between min-w-[93px]",
            available ? "gap-2" : "gap-1",
          )}
        >
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1 text-sm text-[#fff] rounded-lg font-primary bg-theme-primary"
            onClick={() =>
              isInCart
                ? removeFromCart(domain)
                : addToCart({ domain, storage: 10 })
            }
          >
            {!isInCart ? (
              <>
                Add to cart
                <ShoppingBasketHorizontal width={20} height={20} />
              </>
            ) : (
              <>
                Added
                <Tick width={24} height={24} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
