
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { useSharedQuizzes } from '@/hooks/useSharedQuizzes'
import { useToast } from '@/hooks/use-toast'

interface Question {
  question: string
  options: string[]
  correct: number
  explanation: string
}

interface Quiz {
  questions: Question[]
}

interface QuizDisplayProps {
  quiz: Quiz
  quizId: string
  quizTitle: string
  onBackToList: () => void
}

const QuizDisplay = ({ quiz, quizId, quizTitle, onBackToList }: QuizDisplayProps) => {
  const { saveQuizResult } = useSharedQuizzes()
  const { toast } = useToast()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Calculate final score
      const finalScore = selectedAnswers.reduce((acc, answer, index) => {
        return acc + (answer === quiz.questions[index].correct ? 1 : 0)
      }, 0)
      setScore(finalScore)
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true)
    try {
      console.log('Submitting quiz with ID:', quizId, 'Type:', typeof quizId)
      
      const result = await saveQuizResult(quizId, score, quiz.questions.length, selectedAnswers)
      if (result) {
        toast({
          title: "Quiz Submitted Successfully!",
          description: `Your score of ${score}/${quiz.questions.length} has been saved.`,
        })
        
        // Wait a moment then go back to list
        setTimeout(() => {
          onBackToList()
        }, 2000)
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showResults) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black text-center">
            Quiz Results
          </CardTitle>
          <p className="text-center text-gray-600">{quizTitle}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-black mb-2">
              {score}/{quiz.questions.length}
            </div>
            <p className="text-gray-600">
              You scored {Math.round((score / quiz.questions.length) * 100)}%
            </p>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((question, index) => {
              const userAnswer = selectedAnswers[index]
              const isCorrect = userAnswer === question.correct
              
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-black mb-2">{question.question}</p>
                      <p className="text-sm text-gray-600 mb-1">
                        Your answer: {question.options[userAnswer]}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-600 mb-1">
                          Correct answer: {question.options[question.correct]}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={onBackToList} 
              variant="outline"
              className="flex-1 border-gray-300"
              disabled={isSubmitting}
            >
              Back to Quiz Pool
            </Button>
            <Button 
              onClick={handleSubmitQuiz} 
              className="flex-1 bg-black text-white hover:bg-gray-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const question = quiz.questions[currentQuestion]

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-black">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </CardTitle>
          <div className="text-sm text-gray-500">
            Progress: {Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%
          </div>
        </div>
        <p className="text-gray-600">{quizTitle}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <h3 className="text-lg font-medium text-black">{question.question}</h3>
        
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                selectedAnswers[currentQuestion] === index
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium text-gray-900">{String.fromCharCode(65 + index)}.</span>
              <span className="ml-2 text-gray-700">{option}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
            className="border-gray-300"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestion] === undefined}
            className="bg-black text-white hover:bg-gray-800"
          >
            {currentQuestion === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default QuizDisplay
