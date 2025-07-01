
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Youtube, Loader2 } from 'lucide-react'
import LocalQuizDisplay from '@/components/LocalQuizDisplay'

const YouTubeQuiz = () => {  
  const [videoUrl, setVideoUrl] = useState('')
  const [quiz, setQuiz] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleRestart = () => {
    setQuiz(null)
    setVideoUrl('')
  }

  const generateQuiz = async () => {
    setIsLoading(true)
    try {
      // Simulate quiz generation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500))

      const generatedQuiz = {
        questions: [
          {
            question: "What is the main topic of the video?",
            options: ["Technology", "Cooking", "Travel", "Science"],
            correct: 0,
            explanation: "The video primarily discusses technology."
          },
          {
            question: "Who is the presenter in the video?",
            options: ["John Doe", "Jane Smith", "An AI", "A group of experts"],
            correct: 2,
            explanation: "The presenter is an AI."
          },
          {
            question: "What is the video's length?",
            options: ["5 minutes", "10 minutes", "15 minutes", "20 minutes"],
            correct: 1,
            explanation: "The video is 10 minutes long."
          }
        ]
      }

      setQuiz(generatedQuiz)
      toast({
        title: "Quiz Generated!",
        description: "The quiz based on the YouTube video has been generated.",
      })
    } catch (error) {
      console.error("Error generating quiz:", error)
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black">YouTube Quiz Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Generate quizzes from YouTube videos. Simply paste the video URL and let our AI create engaging questions!
          </p>
        </CardContent>
      </div>
      
      {quiz ? (
        <LocalQuizDisplay quiz={quiz} onRestart={handleRestart} />
      ) : (
        <Card className="border-2 border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black">Enter YouTube Video URL</CardTitle>
            <CardDescription>Paste the link to generate a quiz.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Input 
                type="url" 
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button 
              className="w-full bg-black text-white hover:bg-gray-800"
              onClick={generateQuiz}
              disabled={isLoading || !videoUrl}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Youtube className="mr-2 h-4 w-4" />
                  Generate Quiz
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default YouTubeQuiz
