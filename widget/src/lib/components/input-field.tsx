import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const InputField = ({ type = "text", ...params }: InputProps = {}) => {
  return (
    <div className="flex-grow">
      <input
        {...params}
        className="w-full h-full px-3 py-4 text-sm border rounded-xl border-[#444444]"
        type={type}
      />
    </div>
  );
};
