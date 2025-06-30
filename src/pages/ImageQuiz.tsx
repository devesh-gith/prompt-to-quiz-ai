import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Image, Upload, Loader2, X } from 'lucide-react'
import { useState, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import QuizDisplay from '@/components/QuizDisplay'
import ShareQuizButton from '@/components/ShareQuizButton'

const ImageQuiz = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [quiz, setQuiz] = useState(null)
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive",
        })
        return
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image file must be less than 10MB",
          variant: "destructive",
        })
        return
      }

      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remove the data URL prefix to get just the base64 string
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
    })
  }

  const handleGenerateQuiz = async () => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const imageBase64 = await convertToBase64(selectedImage)
      
      const { data, error } = await supabase.functions.invoke('generate-image-quiz', {
        body: { imageBase64, questionCount: 5 }
      })

      if (error) throw error

      setQuiz(data)
      setSavedQuizId(null) // Reset saved quiz ID for new quiz
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
    setSelectedImage(null)
    setImagePreview(null)
    setSavedQuizId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (quiz) {
    return (
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Image className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">Image to Quiz</h1>
                <p className="text-gray-600">Your quiz is ready!</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ShareQuizButton
                quizId={savedQuizId}
                quizData={quiz}
                quizType="image"
                title={`Image Quiz - ${selectedImage?.name || 'Generated'}`}
                description="Quiz generated from uploaded image"
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
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <Image className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">Image to Quiz</h1>
            <p className="text-gray-600">Upload an image and generate quiz questions using AI</p>
          </div>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-black">Upload Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Drag and drop an image here, or click to browse</p>
              <p className="text-sm text-gray-500">Supports JPG, PNG, GIF files (max 10MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 bg-black text-white hover:bg-gray-800"
              >
                Choose Image
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Selected image"
                  className="w-full max-h-64 object-contain rounded-lg border"
                />
                <Button
                  onClick={removeImage}
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 text-center">
                {selectedImage?.name} ({Math.round((selectedImage?.size || 0) / 1024)} KB)
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quiz Settings</p>
              <p className="text-xs text-gray-500">Will generate 5 multiple choice questions</p>
            </div>
            <Button 
              onClick={handleGenerateQuiz}
              disabled={isLoading || !selectedImage}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
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

export default ImageQuiz
