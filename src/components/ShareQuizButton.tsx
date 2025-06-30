
import { Button } from '@/components/ui/button'
import { Share2, Users } from 'lucide-react'
import { useOrganization } from '@clerk/clerk-react'
import { useQuizOperations } from '@/hooks/useQuizOperations'

interface ShareQuizButtonProps {
  quizId?: string
  quizData?: any
  quizType: string
  title: string
  description?: string
  onQuizSaved?: (quizId: string) => void
}

const ShareQuizButton = ({ 
  quizId, 
  quizData, 
  quizType, 
  title, 
  description, 
  onQuizSaved 
}: ShareQuizButtonProps) => {
  const { organization } = useOrganization()
  const { saveQuiz, shareQuizWithOrganization, isSaving } = useQuizOperations()

  const handleShare = async () => {
    if (!organization) return

    let currentQuizId = quizId

    // If we don't have a quizId, save the quiz first
    if (!currentQuizId && quizData) {
      const savedQuiz = await saveQuiz(quizData, quizType, title, description)
      if (!savedQuiz) return
      currentQuizId = savedQuiz.id
      onQuizSaved?.(savedQuiz.id)
    }

    // Now share the quiz
    if (currentQuizId) {
      await shareQuizWithOrganization(currentQuizId)
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

  return (
    <Button 
      onClick={handleShare}
      disabled={isSaving || (!quizId && !quizData)}
      variant="outline"
      className="flex items-center space-x-2"
    >
      <Share2 className="h-4 w-4" />
      <span>
        {isSaving 
          ? 'Sharing...' 
          : `Share with ${organization.name}`
        }
      </span>
    </Button>
  )
}

export default ShareQuizButton
