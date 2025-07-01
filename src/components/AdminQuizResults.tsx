
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Trophy, User, Mail, Image, Youtube, FileText, MessageSquare, Sparkles } from 'lucide-react'
import { useAdminQuizResults } from '@/hooks/useAdminQuizResults'
import { AdminTableSkeleton } from '@/components/LoadingSkeleton'

const AdminQuizResults = () => {
  const { results, isLoading } = useAdminQuizResults()

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

  const getScoreBadgeColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return 'bg-green-50 text-green-700 border-green-200'
    if (percentage >= 60) return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    return 'bg-red-50 text-red-700 border-red-200'
  }

  const getScoreLabel = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return 'Excellent'
    if (percentage >= 60) return 'Good'
    return 'Needs Improvement'
  }

  if (isLoading) {
    return <AdminTableSkeleton />
  }

  if (results.length === 0) {
    return (
      <Card className="border-2 border-gray-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-black flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Organization Quiz Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 border-2 border-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">No Quiz Results Yet</h3>
            <p className="text-gray-600">
              No members have taken any organization quizzes yet.
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
          <span>Organization Quiz Results</span>
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Track member performance across all organization quizzes (results automatically clear after 24 hours)
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-black">Member</TableHead>
                <TableHead className="font-semibold text-black">Quiz</TableHead>
                <TableHead className="font-semibold text-black">Score</TableHead>
                <TableHead className="font-semibold text-black">Performance</TableHead>
                <TableHead className="font-semibold text-black">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => {
                const IconComponent = getQuizIcon(result.quiz_type)
                const percentage = Math.round((result.score / result.total_questions) * 100)
                
                return (
                  <TableRow key={result.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-black">{result.user_name}</div>
                          <div className="text-xs text-gray-500 flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{result.user_email}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-black truncate max-w-[200px]">
                            {result.quiz_title}
                          </div>
                          <Badge variant="outline" className="text-xs mt-1 border-gray-300 text-gray-600">
                            {getQuizTypeLabel(result.quiz_type)}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-center">
                        <div className="text-lg font-bold text-black">
                          {result.score}/{result.total_questions}
                        </div>
                        <div className="text-xs text-gray-500">
                          {percentage}%
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={`${getScoreBadgeColor(result.score, result.total_questions)} font-semibold`}>
                        {getScoreLabel(result.score, result.total_questions)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(result.completed_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(result.completed_at).toLocaleTimeString()}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default AdminQuizResults
