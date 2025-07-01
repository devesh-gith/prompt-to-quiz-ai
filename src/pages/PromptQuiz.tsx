import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Sparkles, Loader2 } from 'lucide-react'
import LocalQuizDisplay from '@/components/LocalQuizDisplay'

const PromptQuiz = () => {
  const [prompt, setPrompt] = useState('')
  const [quiz, setQuiz] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const generateQuiz = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate quiz: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      if (data && data.quiz) {
        setQuiz(data.quiz)
      } else {
        toast({
          title: "Error",
          description: "Failed to generate quiz. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error during quiz generation:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate quiz. Please check your prompt and try again.",
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

  return (
    <div>
      <Card className="w-full max-w-3xl mx-auto border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-black">AI Quiz Generator</CardTitle>
          <p className="text-gray-600">
            Enter a topic or prompt and let AI generate a quiz for you.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!quiz && (
            <div className="space-y-2">
              <Textarea
                placeholder="Enter a topic for the quiz (e.g., 'History of Rome', 'JavaScript fundamentals')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block w-full p-2.5"
              />
              <Button
                onClick={generateQuiz}
                className="w-full bg-black text-white hover:bg-gray-800"
                disabled={isLoading || !prompt}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Quiz
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {quiz ? (
        <LocalQuizDisplay quiz={quiz} onRestart={handleRestart} />
      ) : (
        null
      )}
    </div>
  )
}

export default PromptQuiz
