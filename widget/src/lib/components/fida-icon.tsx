import { ComponentPropsWithoutRef } from "react";

export const FidaIcon = (props: ComponentPropsWithoutRef<"svg">) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 56 64"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinejoin="round"
        d="m28 4 .015 13.1M52.46 46.01l-11.137-6.555M4.099 46.01l11.137-6.555"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M28.009 32.01 15 24.49l13.009-7.518L41 24.52l-12.991 7.49Z"
      />
      <path
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m28.02 46.969-13.003-7.463L15 24.49l13.02 7.52V46.97Z"
      />
      <path
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m28 46.969 13.003-7.43V24.521L28 32.01v14.958Z"
      />
      <path
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeWidth="3"
        d="M52 46.01V18.032L28 4.042 4 18.032V46.01L28 60l24-13.99Z"
      />
      <path
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeWidth="3"
        d="M4.04 18.056 28 32.047l24.04-13.99"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeMiterlimit="10"
        strokeWidth="3"
        d="M28 32.046V60"
      />
    </svg>
  );
};
