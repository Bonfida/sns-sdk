import { twMerge } from "tailwind-merge";
import { ShoppingBasketHorizontal, Tick } from "react-huge-icons/outline";
import { useContext } from "react";
import { CartContext } from "../contexts/cart";
import { DomainCardBase } from "./domain-card-base";
import { priceFromLength } from "../utils";

export const DomainSearchResultRow = ({
  domain,
  available = false,
  price,
}: {
  domain: string;
  available?: boolean;
  price?: number;
}) => {
  const { cart, addToCart, removeFromCart } = useContext(CartContext);

  price = price ?? priceFromLength(domain);

  const isInCart = Boolean(cart[domain]);

  return (
    <DomainCardBase domain={domain} available={available} price={price}>
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
                : addToCart({ domain, storage: 10_000, price: Number(price) })
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
    </DomainCardBase>
  );
};
