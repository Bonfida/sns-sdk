import { useContext } from "react";
import { Edit } from "react-huge-icons/solid";
import { TrashBent } from "react-huge-icons/outline";

import { CartContext } from "../contexts/cart";
import { DomainCardBase } from "./domain-card-base";

interface DomainCartItemProps {
  domain: string;
  onEdit?: () => void;
}

export const DomainCartItem = ({ domain, onEdit }: DomainCartItemProps) => {
  const { cart, removeFromCart } = useContext(CartContext);
  const cartItem = cart[domain];

  return (
    <DomainCardBase domain={cartItem.domain} available price={cartItem.price}>
      <div className="flex flex-col items-end gap-2 text-sm">
        <div className="flex flex-row gap-2">
          <span>Storage: {cartItem.storage / 1_000}kB</span>
          <button
            type="button"
            className="flex items-center text-theme-primary dark:text-theme-secondary gap-0.5"
            tabIndex={0}
            onClick={onEdit}
          >
            Edit
            <Edit width={16} height={16} />
          </button>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 text-theme-primary dark:text-theme-secondary"
          tabIndex={0}
          onClick={() => removeFromCart(domain)}
        >
          Remove
          <TrashBent width={20} height={20} />
        </button>
      </div>
    </DomainCardBase>
  );
};
