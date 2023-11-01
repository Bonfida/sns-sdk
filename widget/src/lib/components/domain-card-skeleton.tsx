export const DomainCardSkeleton = () => {
  return (
    <div className="flex flex-row items-center justify-between gap-4 px-4 py-3 shadow-domain dark:shadow-none rounded-xl bg-background-secondary h-[72px] animate-pulse">
      <div className="w-[80px] h-4 rounded-full bg-background-skeleton"></div>
      <div className="h-4 rounded-full w-[120px] bg-background-skeleton"></div>
    </div>
  );
};
