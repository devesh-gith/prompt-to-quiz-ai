
import QuizCard from './QuizCard'

interface QuizGridProps {
  quizzes: any[]
  takenQuizzes: Set<string>
  onTakeQuiz: (quiz: any) => void
}

const QuizGrid = ({ quizzes, takenQuizzes, onTakeQuiz }: QuizGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz: any) => (
        <QuizCard
          key={quiz.id}
          quiz={quiz}
          onTakeQuiz={onTakeQuiz}
          hasBeenTaken={takenQuizzes.has(quiz.id)}
        />
      ))}
    </div>
  )
}

export default QuizGrid
