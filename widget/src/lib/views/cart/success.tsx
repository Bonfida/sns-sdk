import { CheckMarkCircle } from "react-huge-icons/outline";

export const CartSuccess = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-3 grow-[0.5] text-center">
      <CheckMarkCircle
        width={90}
        height={90}
        className="text-theme-primary text-opacity-60"
      />

      <p className="text-lg font-bold font-primary">
        Congrats on registering your domains!
      </p>

      <p className="text-sm font-primary">
        Head over to
        <a
          href="https://www.sns.id/"
          rel="noopener"
          target="_blank"
          className="mx-1 text-theme-primary"
        >
          sns.id
        </a>
        to learn how to take full advantage of your domains
      </p>
    </div>
  );
};
