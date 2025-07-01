
import { useOrganization } from '@clerk/clerk-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'

interface EmptyQuizStateProps {
  isAdmin: boolean
}

const EmptyQuizState = ({ isAdmin }: EmptyQuizStateProps) => {
  const { organization } = useOrganization()

  return (
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
  )
}

export default EmptyQuizState
