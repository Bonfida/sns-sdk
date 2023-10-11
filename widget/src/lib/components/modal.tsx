import {
  useRef,
  type ReactNode,
  type MouseEvent,
  useEffect,
  useCallback,
} from "react";
import { twMerge } from "tailwind-merge";

interface ModalProps {
  children: ReactNode;
  isVisible: boolean;
  toggleVisibility: (state: boolean) => void;
}

export const BaseModal = ({
  children,
  isVisible,
  toggleVisibility,
}: ModalProps) => {
  const myNodeRef = useRef<HTMLDivElement>(null);

  const toggleModal = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (event.target === myNodeRef.current) {
      toggleVisibility(!isVisible);
    }
  };

  const handleKeyClose = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === "Escape") toggleVisibility(false);
    },
    [toggleVisibility],
  );

  useEffect(() => {
    if (isVisible) document.addEventListener("keydown", handleKeyClose);
    if (!isVisible) document.removeEventListener("keydown", handleKeyClose);
  }, [isVisible, handleKeyClose]);

  return (
    <div
      className={twMerge(
        "absolute top-0 bottom-0 left-0 right-0",
        "bg-[#000] bg-opacity-60 z-[1] opacity-0 invisible transition duration-300",
        "flex items-center justify-center",
        isVisible && "opacity-1 visible",
      )}
      ref={myNodeRef}
      onClick={toggleModal}
    >
      {children}
    </div>
  );
};
