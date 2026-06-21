export function PageSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-aegis-border rounded w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-4 bg-aegis-border rounded w-24" />
                  <div className="h-8 bg-aegis-border rounded w-20" />
                </div>
                <div className="h-12 w-12 bg-aegis-border rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6">
          <div className="h-4 bg-aegis-border rounded w-32 mb-4" />
          <div className="h-[160px] bg-aegis-dark rounded-lg" />
        </div>
        <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6">
          <div className="h-4 bg-aegis-border rounded w-40 mb-4" />
          <div className="h-[160px] bg-aegis-dark rounded-lg" />
          <div className="mt-4 space-y-2">
            <div className="h-4 bg-aegis-border rounded w-24" />
            <div className="h-6 bg-aegis-border rounded w-16" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6">
          <div className="h-4 bg-aegis-border rounded w-32 mb-4" />
          <div className="h-[200px] bg-aegis-dark rounded-lg" />
        </div>
        <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6">
          <div className="h-4 bg-aegis-border rounded w-28 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-aegis-border rounded w-32" />
                  <div className="h-3 bg-aegis-border rounded w-20" />
                </div>
                <div className="h-2 bg-aegis-border rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
