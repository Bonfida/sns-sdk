export const CartProcessing = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-10 grow">
      <div className="w-[76px] h-[76px] rounded-full border-4 border-theme-secondary border-t-theme-primary animate-spin"></div>
      <span className="max-w-[225px] font-primary text-center font-medium tracking-wider">
        Your transaction is being processed...
      </span>
    </div>
  );
};
