import { InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const InputField = ({
  type = "text",
  className,
  ...params
}: InputProps = {}) => {
  return (
    <div className="flex-grow">
      <input
        {...params}
        className={twMerge(
          "w-full h-full px-3 py-4 text-sm border border-opacity-25 rounded-xl border-field-border bg-background-secondary",
          className,
        )}
        type={type}
      />
    </div>
  );
};
