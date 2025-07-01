
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export const QuizCardSkeleton = () => (
  <Card className="border-2 border-gray-200 bg-white shadow-sm">
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-24" />
      </div>
    </CardHeader>
    
    <CardContent className="space-y-4 pt-0">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-8" />
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-100">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </CardContent>
  </Card>
)

export const QuizResultsSkeleton = () => (
  <Card className="border-2 border-gray-200 bg-white">
    <CardHeader className="pb-4">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-6 w-48" />
      </div>
      <Skeleton className="h-4 w-64 mt-1" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4 flex-1">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <Skeleton className="h-5 w-12 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

export const AdminTableSkeleton = () => (
  <Card className="border-2 border-gray-200 bg-white">
    <CardHeader className="pb-4">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-6 w-56" />
      </div>
      <Skeleton className="h-4 w-80 mt-1" />
    </CardHeader>
    <CardContent>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 p-4 border-b">
          <div className="grid grid-cols-5 gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-5 gap-4 items-center">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="text-center">
                <Skeleton className="h-5 w-12 mb-1 mx-auto" />
                <Skeleton className="h-3 w-8 mx-auto" />
              </div>
              <Skeleton className="h-6 w-20" />
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)
