export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center animate-pulse-soft">
          <i className="fa-solid fa-leaf text-2xl text-primary-600"/>
        </div>
        <p className="text-sm text-gray-400">در حال بارگذاری...</p>
      </div>
    </div>
  )
}

export function ProductSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="w-full h-40 bg-sage-100"/>
      <div className="p-3 space-y-2">
        <div className="h-3 bg-sage-100 rounded w-1/3"/>
        <div className="h-4 bg-sage-100 rounded w-4/5"/>
        <div className="h-3 bg-sage-100 rounded w-2/3"/>
        <div className="h-4 bg-sage-100 rounded w-1/2"/>
        <div className="h-9 bg-sage-100 rounded-xl mt-2"/>
      </div>
    </div>
  )
}
