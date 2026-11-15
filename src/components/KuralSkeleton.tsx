import { QUOTE_CONTAINER } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { m } from "motion/react";
import { ENTRANCE } from "@/lib/motion";

const bar = "animate-skeleton rounded-sm bg-quote";

function KuralSkeleton() {
  return (
    <m.div
      className={QUOTE_CONTAINER}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: ENTRANCE }}
    >
      <div className={cn(bar, "mb-2.5 h-7 w-35 sm:mb-4")} />
      <div className={cn(bar, "mb-2.5 h-9.5 w-55 sm:mb-4")} />
      <div className="mb-5">
        <div className={cn(bar, "mb-2 h-11 w-4/5 max-w-125")} />
        <div className={cn(bar, "mb-2 h-11 w-[65%] max-w-100")} />
      </div>
      <div className={cn(bar, "mb-5 h-15 w-4/5 max-w-125")} />
      <div className={cn(bar, "mb-5 h-15 w-[65%] max-w-100")} />
    </m.div>
  );
}

export default KuralSkeleton;
