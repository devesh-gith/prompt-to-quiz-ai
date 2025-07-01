
import { QuizCardSkeleton } from '@/components/LoadingSkeleton'

const QuizLoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <QuizCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default QuizLoadingSkeleton
