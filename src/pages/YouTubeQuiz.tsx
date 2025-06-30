import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Youtube, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import QuizDisplay from '@/components/QuizDisplay'
import ShareQuizButton from '@/components/ShareQuizButton'

const YouTubeQuiz = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [quiz, setQuiz] = useState(null)
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerateQuiz = async () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      })
      return
    }

    // Validate YouTube URL format
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/
    if (!youtubeRegex.test(youtubeUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('generate-youtube-quiz', {
        body: { youtubeUrl, questionCount: 5 }
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
        description: "Failed to generate quiz. This may take a few minutes for longer videos.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestart = () => {
    setQuiz(null)
    setYoutubeUrl('')
    setSavedQuizId(null)
  }

  if (quiz) {
    return (
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">YouTube to Quiz</h1>
                <p className="text-gray-600">Your quiz is ready!</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ShareQuizButton
                quizId={savedQuizId}
                quizData={quiz}
                quizType="youtube"
                title={`YouTube Quiz - ${youtubeUrl}`}
                description="Quiz generated from YouTube video"
                onQuizSaved={setSavedQuizId}
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
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
            <p className="text-sm text-gray-500">Enter a valid YouTube video URL</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quiz Settings</p>
              <p className="text-xs text-gray-500">Will generate 5 multiple choice questions</p>
            </div>
            <Button 
              onClick={handleGenerateQuiz}
              disabled={isLoading || !youtubeUrl.trim()}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
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

export default YouTubeQuiz
