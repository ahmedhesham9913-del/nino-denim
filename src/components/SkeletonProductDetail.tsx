"use client";

export default function SkeletonProductDetail() {
  return (
    <div className="min-h-screen pt-28 pb-16 px-6" style={{ background: "oklch(0.97 0.006 250)" }}>
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Image gallery skeleton */}
          <div className="lg:col-span-7">
            <div className="aspect-[3/4] rounded-2xl bg-nino-100/40 animate-pulse" />
            <div className="flex gap-3 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-20 rounded-xl bg-nino-100/40 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="h-3 w-24 bg-nino-100/60 rounded-full animate-pulse" />
              <div className="h-10 w-64 bg-nino-100/50 rounded-full animate-pulse" />
              <div className="h-8 w-20 bg-nino-100/60 rounded-full animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="h-3 w-full bg-nino-100/40 rounded-full animate-pulse" />
              <div className="h-3 w-full bg-nino-100/40 rounded-full animate-pulse" />
              <div className="h-3 w-3/4 bg-nino-100/40 rounded-full animate-pulse" />
            </div>

            <div className="space-y-3">
              <div className="h-3 w-16 bg-nino-100/60 rounded-full animate-pulse" />
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-xl bg-nino-100/40 animate-pulse" />
                ))}
              </div>
            </div>

            <div className="h-14 w-full rounded-xl bg-nino-100/40 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
