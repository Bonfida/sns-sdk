import { abbreviate } from "../utils";
import { twMerge } from "tailwind-merge";

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
    <div className="flex flex-row items-center gap-4 px-4 py-3 my-2 border-0 rounded-xl bg-background-secondary">
      <div className="flex-auto mr-auto">
        <span className="text-base text-content-secondary">
          {abbreviate(`${domain}.sol`, 25, 3)}
        </span>
      </div>
      {!available && (
        <div className="rounded-[100px] border border-content-success px-3 bg-content-success bg-opacity-10">
          <span className="text-xs font-semibold leading-6 text-content-success">
            Purchased
          </span>
        </div>
      )}
      <div
        className={twMerge(
          "flex items-center flex-row justify-between min-w-[93px]",
          available ? "gap-2" : "gap-1",
        )}
      >
        <div className="flex flex-row items-center gap-1">
          USDC
          <span className="text-sm font-medium text-content-primary">
            {/* TODO: locale formatting */}
            {price}
          </span>
        </div>
        {/* <button
          onClick={
            available
              ? handle
              : () => navigation.navigate("domain-div", { domain })
          }
          className={twMerge(
            "h-[32px] w-[32px] flex items-center justify-center",
            available && "border rounded-md border-brand-primary",
            available && !inCart && "bg-brand-primary",
          )}
        >
          {available ? (
            inCart ? (
              <MaterialCommunityIcons
                name="delete-outline"
                size={24}
                color={tw.color("brand-primary")}
              />
            ) : (
              <Feather name="shopping-cart" size={18} color="white" />
            )
          ) : (
            <Feather name="arrow-right" size={20} color="#ADAEB2" />
          )}
        </button> */}
      </div>
    </div>
  );
};
