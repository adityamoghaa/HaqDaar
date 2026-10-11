// Skeleton loader for content placeholders
export function Skeleton({ className = "", variant = "line" }) {
  const base = "animate-shimmer rounded-lg bg-white/[0.04]";

  if (variant === "circle") {
    return <div className={`${base} rounded-full ${className}`} />;
  }

  if (variant === "card") {
    return (
      <div className={`${base} rounded-xl p-4 space-y-3 ${className}`}>
        <div className="h-4 bg-white/[0.04] rounded w-3/4" />
        <div className="h-3 bg-white/[0.04] rounded w-1/2" />
        <div className="h-3 bg-white/[0.04] rounded w-5/6" />
      </div>
    );
  }

  return <div className={`${base} h-4 ${className}`} />;
}

export function MessageSkeleton() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] glass rounded-2xl rounded-bl-md px-4 py-3 space-y-2">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-3 w-52" />
      </div>
    </div>
  );
}

export function SchemeCardSkeleton() {
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton variant="circle" className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
    </div>
  );
}
