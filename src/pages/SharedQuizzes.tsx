
import { useOrganization, useUser } from '@clerk/clerk-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Share2, Play, Calendar, User, Building } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const SharedQuizzes = () => {
  const { user } = useUser()
  const { organization } = useOrganization()

  // Mock data for shared quizzes - in real implementation, this would come from your backend
  const mockSharedQuizzes = [
    {
      id: '1',
      title: 'Marketing Fundamentals Quiz',
      description: 'Test your knowledge of basic marketing concepts',
      createdBy: 'John Admin',
      createdAt: '2024-01-15',
      organization: 'Marketing Team',
      type: 'PDF Quiz',
      questionsCount: 15,
      status: 'active'
    },
    {
      id: '2',
      title: 'Product Launch Strategy',
      description: 'Quiz based on our product launch presentation',
      createdBy: 'Sarah Manager',
      createdAt: '2024-01-12',
      organization: 'Product Team',
      type: 'YouTube Quiz',
      questionsCount: 10,
      status: 'active'
    },
  ]

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

      {mockSharedQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockSharedQuizzes.map((quiz) => (
            <Card key={quiz.id} className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-black mb-2">
                      {quiz.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mb-3">
                      {quiz.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {quiz.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Created by:</span>
                    <span className="font-semibold text-black">{quiz.createdBy}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold text-black">
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Share2 className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Questions:</span>
                    <span className="font-semibold text-black">{quiz.questionsCount}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <Button 
                    className="w-full bg-black hover:bg-gray-800 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Take Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
