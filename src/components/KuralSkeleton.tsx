import React from "react";
import { QUOTE_CONTAINER } from "@/lib/styles";
import { cn } from "@/lib/utils";

const bar = "animate-skeleton rounded-sm bg-quote";

const KuralSkeleton: React.FC = () => (
  <div className={QUOTE_CONTAINER}>
    <div className={cn(bar, "mb-[15px] h-7 w-[140px]")} />
    <div className={cn(bar, "mb-[15px] h-[38px] w-[220px]")} />
    <div className="mb-5">
      <div className={cn(bar, "mb-2 h-[38px] w-4/5 max-w-[500px]")} />
      <div className={cn(bar, "mb-2 h-[38px] w-[65%] max-w-[410px]")} />
    </div>
    <div className={cn(bar, "mb-5 h-[58px] w-4/5 max-w-[500px]")} />
    <div className={cn(bar, "mb-5 h-[58px] w-[65%] max-w-[410px]")} />
  </div>
);

export default KuralSkeleton;
