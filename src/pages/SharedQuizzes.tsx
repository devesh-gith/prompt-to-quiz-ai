
import { useOrganization, useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { useSharedQuizzes } from '@/hooks/useSharedQuizzes'
import { useOrganizationRole } from '@/hooks/useOrganizationRole'
import { useEffect, useState } from 'react'
import QuizDisplay from '@/components/QuizDisplay'
import SharedQuizzesHeader from '@/components/shared-quizzes/SharedQuizzesHeader'
import QuizGrid from '@/components/shared-quizzes/QuizGrid'
import EmptyQuizState from '@/components/shared-quizzes/EmptyQuizState'
import QuizLoadingSkeleton from '@/components/shared-quizzes/QuizLoadingSkeleton'

const SharedQuizzes = () => {
  const { user } = useUser()
  const { organization } = useOrganization()
  const { getSharedQuizzes, isLoading, getQuizResults } = useSharedQuizzes()
  const { getCurrentOrganizationRole } = useOrganizationRole()
  const [quizzes, setQuizzes] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [takenQuizzes, setTakenQuizzes] = useState(new Set())

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (organization) {
        console.log('Fetching quizzes for organization:', organization.name)
        const sharedQuizzes = await getSharedQuizzes()
        console.log('Received quizzes:', sharedQuizzes)
        setQuizzes(sharedQuizzes)
        
        // Fetch taken quiz results for current user
        if (user) {
          const results = await getQuizResults()
          const takenQuizIds = new Set(results.map(result => result.quiz_id))
          setTakenQuizzes(takenQuizIds)
        }
      }
    }

    fetchQuizzes()
    
    // Refresh every 30 seconds to show new quizzes and remove expired ones
    const interval = setInterval(fetchQuizzes, 30000)
    return () => clearInterval(interval)
  }, [organization, user])

  const handleTakeQuiz = (quiz: any) => {
    console.log('Taking quiz:', quiz.title)
    setSelectedQuiz(quiz)
  }

  const handleBackToList = () => {
    setSelectedQuiz(null)
    // Refresh quizzes to update taken status
    const fetchQuizzes = async () => {
      if (organization && user) {
        const sharedQuizzes = await getSharedQuizzes()
        setQuizzes(sharedQuizzes)
        const results = await getQuizResults()
        const takenQuizIds = new Set(results.map(result => result.quiz_id))
        setTakenQuizzes(takenQuizIds)
      }
    }
    fetchQuizzes()
  }

  const { isAdmin } = organization ? getCurrentOrganizationRole(organization.id) : { isAdmin: false }

  // If a quiz is selected, show the quiz display component
  if (selectedQuiz) {
    return (
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">{selectedQuiz.title}</h1>
              <p className="text-gray-600">{selectedQuiz.description}</p>
            </div>
            <Button onClick={handleBackToList} variant="outline" className="border-black text-black hover:bg-black hover:text-white">
              Back to Quiz Pool
            </Button>
          </div>
        </div>
        <QuizDisplay 
          quiz={selectedQuiz.quiz_data} 
          quizId={selectedQuiz.id}
          quizTitle={selectedQuiz.title}
          onBackToList={handleBackToList} 
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div>
        <SharedQuizzesHeader isAdmin={isAdmin} />
        <QuizLoadingSkeleton />
      </div>
    )
  }

  return (
    <div>
      <SharedQuizzesHeader isAdmin={isAdmin} />
      
      {quizzes.length > 0 ? (
        <QuizGrid 
          quizzes={quizzes}
          takenQuizzes={takenQuizzes}
          onTakeQuiz={handleTakeQuiz}
        />
      ) : (
        <EmptyQuizState isAdmin={isAdmin} />
      )}
    </div>
  )
}

export default SharedQuizzes
