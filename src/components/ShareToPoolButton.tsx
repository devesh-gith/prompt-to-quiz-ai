
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Users, Clock, Shield } from 'lucide-react'
import { useOrganization } from '@clerk/clerk-react'
import { useSharedQuizzes } from '@/hooks/useSharedQuizzes'
import { useOrganizationRole } from '@/hooks/useOrganizationRole'
import ShareQuizDialog from './ShareQuizDialog'

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
  description = ''
}: ShareToPoolButtonProps) => {
  const { organization } = useOrganization()
  const { saveToSharedQuizzes, isSaving } = useSharedQuizzes()
  const { getCurrentOrganizationRole } = useOrganizationRole()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleShare = async (customTitle: string, customDescription: string) => {
    if (!organization || !quizData) return
    
    const result = await saveToSharedQuizzes(
      quizData, 
      quizType, 
      customTitle, 
      customDescription
    )
    
    if (result) {
      setDialogOpen(false)
    }
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
    <>
      <Button 
        onClick={() => setDialogOpen(true)}
        disabled={!quizData}
        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
      >
        <Share2 className="h-4 w-4" />
        <span>Share with {organization.name}</span>
      </Button>

      <ShareQuizDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultTitle={title}
        defaultDescription={description}
        organizationName={organization.name}
        isSharing={isSaving}
        onShare={handleShare}
      />
    </>
  )
}

export default ShareToPoolButton
