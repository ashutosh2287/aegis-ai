export function PageSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-8 bg-gray-200 rounded w-20" />
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
          <div className="h-[160px] bg-gray-100 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="h-4 bg-gray-200 rounded w-40 mb-4" />
          <div className="h-[160px] bg-gray-100 rounded-lg" />
          <div className="mt-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-6 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
          <div className="h-[200px] bg-gray-100 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="h-4 bg-gray-200 rounded w-28 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
                <div className="h-2 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
