
import { Button } from '@/components/ui/button'
import { Share2, Users, Clock, Shield } from 'lucide-react'
import { useOrganization } from '@clerk/clerk-react'
import { useSharedQuizzes } from '@/hooks/useSharedQuizzes'
import { useOrganizationRole } from '@/hooks/useOrganizationRole'

interface ShareToPoolButtonProps {
  quizData?: any
  quizType: string
  title: string
  description?: string
}

const ShareToPoolButton = ({ 
  quizData, 
  quizType, 
  title, 
  description
}: ShareToPoolButtonProps) => {
  const { organization } = useOrganization()
  const { saveToSharedQuizzes, isSaving } = useSharedQuizzes()
  const { getCurrentOrganizationRole } = useOrganizationRole()

  const handleShare = async () => {
    if (!organization || !quizData) return
    await saveToSharedQuizzes(quizData, quizType, title, description)
  }

  if (!organization) {
    return (
      <Button variant="outline" disabled className="flex items-center space-x-2">
        <Users className="h-4 w-4" />
        <span>Join Organization to Share</span>
      </Button>
    )
  }

  const { isAdmin, isLoading: roleLoading } = getCurrentOrganizationRole(organization.id)

  if (roleLoading) {
    return (
      <Button variant="outline" disabled className="flex items-center space-x-2">
        <Clock className="h-4 w-4 animate-spin" />
        <span>Checking permissions...</span>
      </Button>
    )
  }

  if (!isAdmin) {
    return (
      <Button variant="outline" disabled className="flex items-center space-x-2">
        <Shield className="h-4 w-4" />
        <span>Admin Only - Can't Share to Pool</span>
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleShare}
      disabled={isSaving || !quizData}
      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
    >
      <Share2 className="h-4 w-4" />
      <span>
        {isSaving 
          ? 'Sharing...' 
          : `Share for 1hr with ${organization.name}`
        }
      </span>
    </Button>
  )
}

export default ShareToPoolButton
