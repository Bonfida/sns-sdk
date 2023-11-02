import { InformationCircle } from "react-huge-icons/solid";
import { useContext, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { GlobalStatus, GlobalStatusContext } from "../contexts/status-messages";

export const GlobalStatusCard = ({ status }: { status: GlobalStatus }) => {
  const { setStatus } = useContext(GlobalStatusContext);

  useMemo(() => {
    setTimeout(() => {
      setStatus(null);
    }, 4000);
  }, [setStatus]);

  return (
    <div
      className={twMerge(
        "bg-background-primary dark:border dark:border-interactive-border",
        "shadow-xl dark:shadow-none",
        "absolute top-2.5 left-3 right-3 rounded-lg py-3 px-4 flex gap-2 z-10 overflow-hidden",
      )}
    >
      <div
        className={twMerge(
          "absolute top-0 left-0 right-0 h-0.5 animate-width-to-zero",
          status.status === "error" && "bg-error",
          status.status === "success" && "bg-success",
        )}
      ></div>
      <button
        className="absolute flex items-center justify-center w-5 h-5 top-1 right-1"
        type="button"
        tabIndex={0}
        onClick={() => setStatus(null)}
      >
        <div className="absolute w-4 h-[1px] bg-text-primary rotate-45"></div>
        <div className="absolute w-4 h-[1px] bg-text-primary -rotate-45"></div>
      </button>
      {status.status === "error" && (
        <InformationCircle
          width={20}
          height={20}
          className="rotate-180 text-error mt-0.5 shrink-0"
        />
      )}
      <span className="font-medium font-primary">{status.message}</span>
    </div>
  );
};
