
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Share2, Play, Calendar, FileText, Image, Youtube, MessageSquare, Sparkles, Clock, CheckCircle } from 'lucide-react'

interface QuizCardProps {
  quiz: any
  onTakeQuiz: (quiz: any) => void
  hasBeenTaken: boolean
}

const QuizCard = ({ quiz, onTakeQuiz, hasBeenTaken }: QuizCardProps) => {
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

  const IconComponent = getQuizIcon(quiz.quiz_type)
  const timeRemaining = getTimeRemaining(quiz.expires_at)
  const isExpiringSoon = timeRemaining.includes('min left') && parseInt(timeRemaining) <= 10
  const isExpired = timeRemaining === 'Expired'

  return (
    <Card className="border-2 border-gray-200 hover:border-black transition-all duration-200 bg-white shadow-sm hover:shadow-md">
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
            onClick={() => onTakeQuiz(quiz)}
          >
            <Play className="h-4 w-4 mr-2" />
            {isExpired ? 'Quiz Expired' : hasBeenTaken ? 'Already Completed' : 'Take Quiz'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default QuizCard
