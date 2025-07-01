
import { useOrganization, useUser } from '@clerk/clerk-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Share2, Play, Calendar, Building, FileText, Image, Youtube, MessageSquare, Sparkles, Clock, Shield, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useSharedQuizzes } from '@/hooks/useSharedQuizzes'
import { useOrganizationRole } from '@/hooks/useOrganizationRole'
import { useEffect, useState } from 'react'
import QuizDisplay from '@/components/QuizDisplay'

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

  const getQuizIcon = (quizType: string) => {
    switch (quizType) {
      case 'image':
        return Image
      case 'youtube':
        return Youtube
      case 'pdf':
        return FileText
      case 'text':
        return MessageSquare
      case 'prompt':
        return Sparkles
      default:
        return FileText
    }
  }

  const getQuizTypeLabel = (quizType: string) => {
    switch (quizType) {
      case 'image':
        return 'Image Quiz'
      case 'youtube':
        return 'YouTube Quiz'
      case 'pdf':
        return 'PDF Quiz'
      case 'text':
        return 'Text Quiz'
      case 'prompt':
        return 'Prompt Quiz'
      default:
        return 'Quiz'
    }
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffMs = expiry.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins <= 0) return 'Expired'
    if (diffMins < 60) return `${diffMins} min left`
    
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}m left`
  }

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

  const { isAdmin, role } = organization ? getCurrentOrganizationRole(organization.id) : { isAdmin: false, role: null }

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
        <QuizDisplay quiz={selectedQuiz.quiz_data} onRestart={handleBackToList} />
      </div>
    )
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-64">Loading shared quizzes...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Organization Quiz Pool</h1>
        <p className="text-gray-600">
          Professional quizzes shared by your organization (automatically expire after 1 hour)
        </p>
        {organization && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Organization: <span className="font-semibold text-black">{organization.name}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className={`h-4 w-4 ${isAdmin ? 'text-black' : 'text-gray-500'}`} />
              <span className={`text-sm font-medium ${isAdmin ? 'text-black' : 'text-gray-600'}`}>
                Role: {isAdmin ? 'Admin' : 'Member'}
              </span>
            </div>
          </div>
        )}
      </div>

      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz: any) => {
            const IconComponent = getQuizIcon(quiz.quiz_type)
            const timeRemaining = getTimeRemaining(quiz.expires_at)
            const isExpiringSoon = timeRemaining.includes('min left') && parseInt(timeRemaining) <= 10
            const isExpired = timeRemaining === 'Expired'
            const hasBeenTaken = takenQuizzes.has(quiz.id)
            
            return (
              <Card key={quiz.id} className="border-2 border-gray-200 hover:border-black transition-all duration-200 bg-white shadow-sm hover:shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-bold text-black mb-1 line-clamp-2">
                          {quiz.title}
                        </CardTitle>
                        {quiz.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {quiz.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="border-black text-black font-medium">
                      {getQuizTypeLabel(quiz.quiz_type)}
                    </Badge>
                    <Badge 
                      variant={isExpired ? "destructive" : isExpiringSoon ? "destructive" : "outline"}
                      className={`text-xs ${!isExpired && !isExpiringSoon ? 'border-gray-400 text-gray-600' : ''}`}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {timeRemaining}
                    </Badge>
                    {hasBeenTaken && (
                      <Badge className="bg-black text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Created:</span>
                      </div>
                      <span className="font-semibold text-black">
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Share2 className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Questions:</span>
                      </div>
                      <span className="font-semibold text-black">
                        {quiz.quiz_data?.questions?.length || 0}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <Button 
                      className={`w-full transition-all duration-200 ${
                        isExpired || hasBeenTaken
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-black hover:bg-gray-800 text-white border-2 border-black hover:border-gray-800'
                      }`}
                      disabled={isExpired || hasBeenTaken}
                      onClick={() => handleTakeQuiz(quiz)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isExpired ? 'Quiz Expired' : hasBeenTaken ? 'Already Completed' : 'Take Quiz'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-2 border-gray-200 bg-white">
          <CardContent className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 border-2 border-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="h-10 w-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">No Active Shared Quizzes</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {organization 
                ? `No quizzes have been shared with ${organization.name} recently. ${isAdmin ? 'Create and share a quiz to see it appear here!' : 'Only organization admins can share quizzes.'}`
                : "Join an organization to access shared quizzes from your team."
              }
            </p>
            {!organization && (
              <Button 
                className="bg-black hover:bg-gray-800 text-white border-2 border-black"
                onClick={() => window.location.href = '/dashboard/organizations'}
              >
                View Organizations
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SharedQuizzes
