import { InputHTMLAttributes, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { RemoveThin } from "react-huge-icons/outline";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const InputField = ({
  type = "text",
  value,
  className,
  ...params
}: InputProps = {}) => {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className={twMerge("flex-grow", type === "search" && "relative")}>
      <input
        {...params}
        ref={input}
        value={value}
        className={twMerge(
          "w-full h-full px-3 py-4 text-sm border border-opacity-25 rounded-xl border-field-border dark:border-interactive-border bg-background-secondary text-ellipsis",
          className,
          type === "search" && "pr-8",
        )}
        type={type === "search" ? "text" : type}
      />

      {type === "search" && value && (
        <button
          type="button"
          className="absolute p-1 top-3 right-1"
          aria-label="Clear"
          tabIndex={0}
          onClick={() => {
            if (input.current) {
              input.current.value = "";
            }
          }}
        >
          <RemoveThin width={24} height={24} />
        </button>
      )}
    </div>
  );
};
