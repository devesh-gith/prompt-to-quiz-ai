import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import QuizDisplay from '@/components/QuizDisplay'
import ShareToPoolButton from '@/components/ShareToPoolButton'

const PromptQuiz = () => {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [quiz, setQuiz] = useState(null)
  const { toast } = useToast()

  const handleGenerateQuiz = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for your quiz",
        variant: "destructive",
      })
      return
    }

    if (prompt.length < 10) {
      toast({
        title: "Error", 
        description: "Description must be at least 10 characters long",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('generate-prompt-quiz', {
        body: { prompt, questionCount: 5 }
      })

      if (error) throw error

      setQuiz(data)
      toast({
        title: "Success",
        description: "Quiz generated successfully!",
      })
    } catch (error) {
      console.error('Error generating quiz:', error)
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestart = () => {
    setQuiz(null)
    setPrompt('')
  }

  if (quiz) {
    return (
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">Prompt to Quiz</h1>
                <p className="text-gray-600">Your quiz is ready!</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ShareToPoolButton
                quizData={quiz}
                quizType="prompt"
                title={`Prompt Quiz - ${prompt.slice(0, 50)}...`}
                description="Quiz generated from AI prompt"
              />
              <Button onClick={handleRestart} variant="outline">
                Generate New Quiz
              </Button>
            </div>
          </div>
        </div>
        <QuizDisplay quiz={quiz} onRestart={handleRestart} />
      </div>
    )
  }

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
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Be specific about the topic and difficulty level you want ({prompt.length} characters)
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quiz Settings</p>
              <p className="text-xs text-gray-500">Will generate 5 multiple choice questions</p>
            </div>
            <Button 
              onClick={handleGenerateQuiz}
              disabled={isLoading || prompt.length < 10}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Quiz'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PromptQuiz
