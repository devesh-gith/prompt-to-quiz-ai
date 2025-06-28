
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Youtube } from 'lucide-react'

const YouTubeQuiz = () => {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
            <Youtube className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">YouTube to Quiz</h1>
            <p className="text-gray-600">Convert YouTube videos into engaging quizzes</p>
          </div>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-black">YouTube Video URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Input 
              placeholder="https://www.youtube.com/watch?v=..." 
              className="w-full"
            />
            <p className="text-sm text-gray-500">Enter a valid YouTube video URL</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quiz Settings</p>
              <p className="text-xs text-gray-500">Configure your quiz parameters</p>
            </div>
            <Button disabled className="bg-gray-300 text-gray-500">
              Generate Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default YouTubeQuiz
