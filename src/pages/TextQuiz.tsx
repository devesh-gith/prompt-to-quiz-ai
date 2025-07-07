import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import QuizDisplay from '@/components/QuizDisplay'
import ShareToPoolButton from '@/components/ShareToPoolButton'

const TextQuiz = () => {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [quiz, setQuiz] = useState(null)
  const { toast } = useToast()

  const handleGenerateQuiz = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text content",
        variant: "destructive",
      })
      return
    }

    if (text.length < 100) {
      toast({
        title: "Error", 
        description: "Text must be at least 100 characters long",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('generate-text-quiz', {
        body: { text, questionCount: 5 }
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
    setText('')
  }

  if (quiz) {
    return (
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">Text to Quiz</h1>
                <p className="text-gray-600">Your quiz is ready!</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ShareToPoolButton
                quizData={quiz}
                quizType="text"
                title="Text Quiz"
                description="Quiz generated from text content"
              />
              <Button onClick={handleRestart} variant="outline">
                Generate New Quiz
              </Button>
            </div>
          </div>
        </div>
        <QuizDisplay 
          quiz={quiz} 
          quizId="text-quiz" 
          quizTitle="Text Quiz" 
          onBackToList={handleRestart} 
        />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">Text to Quiz</h1>
            <p className="text-gray-600">Generate quizzes from any text content</p>
          </div>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-black">Enter Text Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Textarea 
              placeholder="Paste your text content here..."
              className="min-h-[200px] w-full resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Minimum 100 words recommended for better quiz generation ({text.length} characters)
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quiz Settings</p>
              <p className="text-xs text-gray-500">Will generate 5 multiple choice questions</p>
            </div>
            <Button 
              onClick={handleGenerateQuiz}
              disabled={isLoading || text.length < 100}
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

export default TextQuiz
