import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { FileText, Loader2 } from 'lucide-react'
import LocalQuizDisplay from '@/components/LocalQuizDisplay'

const TextQuiz = () => {
  const [textContent, setTextContent] = useState('')
  const [quiz, setQuiz] = useState<any>(null)
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
        body: JSON.stringify({
          type: 'text',
          content: textContent,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setQuiz(data)
    } catch (error: any) {
      console.error('Failed to generate quiz:', error)
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
    setTextContent('')
  }

  return (
    <div>
      <Card className="w-[80%] mx-auto border-2 border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-black flex items-center">
            <FileText className="mr-2 h-5 w-5" /> Text Quiz Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!quiz ? (
            <div className="grid gap-4">
              <div className="relative">
                <Textarea
                  placeholder="Paste your text content here..."
                  className="resize-none border-2 border-gray-300 focus-visible:ring-2 focus-visible:ring-black text-gray-700"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
              </div>
              <Button onClick={generateQuiz} className="bg-black text-white hover:bg-gray-800" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Quiz'
                )}
              </Button>
            </div>
          ) : null}
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

export default TextQuiz
