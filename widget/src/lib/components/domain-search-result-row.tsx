import { abbreviate } from "../utils";
import { twMerge } from "tailwind-merge";
import { ShoppingBasketHorizontal, Tick } from "react-huge-icons/outline";

export const DomainSearchResultRow = ({
  domain,
  available = false,
  price,
}: {
  domain: string;
  available?: boolean;
  price?: number | string;
}) => {
  // const [cart, setCart] = useRecoilState(cartState);
  // const inCart = cart.includes(domain);
  // price = price ?? priceFromLength(domain);
  // const navigation = useNavigation<domaindivScreenProp>();

  // const handle = () => {
  //   if (cart.includes(domain)) {
  //     setCart((prev) => prev.filter((e) => e !== domain));
  //   } else {
  //     setCart((prev) => [...prev, domain]);
  //   }
  // };

  return (
    <div className="flex flex-row items-center gap-4 px-4 py-3 rounded-xl bg-background-secondary min-h-[72px]">
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
            className="flex items-center gap-2 px-3 py-1 text-sm text-white rounded-lg font-primary bg-theme-primary"
          >
            Add to cart
            <ShoppingBasketHorizontal width={20} height={20} />
            {/* <Tick width={24} height={24} /> */}
          </button>
        </div>
      )}
    </div>
  );
};
