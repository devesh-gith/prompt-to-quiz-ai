
import { useOrganization, useUser } from '@clerk/clerk-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Share2, Play, Calendar, User, Building, FileText, Image, Youtube, MessageSquare, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useQuizOperations } from '@/hooks/useQuizOperations'
import { useEffect, useState } from 'react'

const SharedQuizzes = () => {
  const { user } = useUser()
  const { organization } = useOrganization()
  const { getSharedQuizzes } = useQuizOperations()
  const [quizzes, setQuizzes] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true)
      const sharedQuizzes = await getSharedQuizzes()
      setQuizzes(sharedQuizzes)
      setIsLoading(false)
    }

    if (organization) {
      fetchQuizzes()
    } else {
      setIsLoading(false)
    }
  }, [organization])

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

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-64">Loading shared quizzes...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Shared Quizzes</h1>
        <p className="text-gray-600">
          Quizzes shared with you by your organization admins
        </p>
        {organization && (
          <div className="mt-4 flex items-center space-x-2">
            <Building className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Currently viewing: <span className="font-semibold">{organization.name}</span>
            </span>
          </div>
        )}
      </div>

      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz: any) => {
            const IconComponent = getQuizIcon(quiz.quiz_type)
            return (
              <Card key={quiz.id} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-black mb-2">
                          {quiz.title}
                        </CardTitle>
                        {quiz.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {quiz.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {getQuizTypeLabel(quiz.quiz_type)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Created:</span>
                      <span className="font-semibold text-black">
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Share2 className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Questions:</span>
                      <span className="font-semibold text-black">
                        {quiz.quiz_data?.questions?.length || 0}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <Button className="w-full bg-black hover:bg-gray-800 text-white">
                      <Play className="h-4 w-4 mr-2" />
                      Take Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-gray-200">
          <CardContent className="text-center py-12">
            <Share2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-2">No Shared Quizzes</h3>
            <p className="text-gray-600 mb-6">
              {organization 
                ? `No quizzes have been shared with ${organization.name} yet.`
                : "Join an organization to access shared quizzes from your team."
              }
            </p>
            {!organization && (
              <Button 
                className="bg-black hover:bg-gray-800 text-white"
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
