import { InformationCircle } from "react-huge-icons/outline";

export const CartError = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-3 grow-[0.5] text-center">
      <InformationCircle
        width={90}
        height={90}
        className="rotate-180 text-theme-primary text-opacity-60"
      />

      <p className="text-lg font-bold font-primary">Something went wrong</p>

      <p className="text-sm font-primary">Please retry the process</p>
    </div>
  );
};
