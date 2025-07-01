
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Trophy, Target, Image, Youtube, FileText, MessageSquare, Sparkles } from 'lucide-react'
import { useRecentQuizResults } from '@/hooks/useRecentQuizResults'

const RecentQuizResults = () => {
  const { results, isLoading } = useRecentQuizResults()

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

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return 'bg-green-50 text-green-700 border-green-200'
    if (percentage >= 60) return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    return 'bg-red-50 text-red-700 border-red-200'
  }

  if (isLoading) {
    return (
      <Card className="border-2 border-gray-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-black flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Recent Quiz Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading recent results...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (results.length === 0) {
    return (
      <Card className="border-2 border-gray-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-black flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Recent Quiz Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 border-2 border-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">No Quiz Results Yet</h3>
            <p className="text-gray-600">
              Take some quizzes from your organization's shared pool to see your results here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-gray-200 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-black flex items-center space-x-2">
          <Trophy className="h-5 w-5" />
          <span>Recent Quiz Results</span>
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Your performance in recent organization quizzes (results automatically clear after 24 hours)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.map((result) => {
          const IconComponent = getQuizIcon(result.quiz_type)
          const percentage = Math.round((result.score / result.total_questions) * 100)
          
          return (
            <div
              key={result.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-black transition-colors bg-gray-50"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-black truncate">
                    {result.quiz_title}
                  </h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                      {getQuizTypeLabel(result.quiz_type)}
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(result.completed_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className={`text-lg font-bold ${getScoreColor(result.score, result.total_questions)}`}>
                    {result.score}/{result.total_questions}
                  </div>
                  <div className="text-xs text-gray-500">
                    {percentage}% Score
                  </div>
                </div>
                <Badge 
                  className={`${getScoreBadgeColor(result.score, result.total_questions)} font-semibold`}
                >
                  {percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default RecentQuizResults
