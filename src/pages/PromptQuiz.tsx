
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles } from 'lucide-react'

const PromptQuiz = () => {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">Prompt to Quiz</h1>
            <p className="text-gray-600">Create quizzes using AI prompts and descriptions</p>
          </div>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-black">Describe Your Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Textarea 
              placeholder="Describe what you want to create a quiz about. For example: 'Create a quiz about the solar system with focus on planets and their characteristics'"
              className="min-h-[150px] w-full resize-none"
            />
            <p className="text-sm text-gray-500">Be specific about the topic and difficulty level you want</p>
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

export default PromptQuiz
