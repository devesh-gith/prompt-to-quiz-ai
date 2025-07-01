import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Upload, Loader2 } from 'lucide-react'
import LocalQuizDisplay from '@/components/LocalQuizDisplay'

const ImageQuiz = () => {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [quiz, setQuiz] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleRestart = () => {
    setQuiz(null)
    setImageFile(null)
    setImagePreview('')
    setIsUploading(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const generateQuiz = async () => {
    if (!imageFile) {
      toast({
        title: "Error",
        description: "Please upload an image first.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      // Simulate quiz generation
      await new Promise(resolve => setTimeout(resolve, 2000))

      const generatedQuiz = {
        questions: [
          {
            question: "What is the main subject of this image?",
            options: ["Nature", "Technology", "People", "Abstract"],
            correct: 0,
            explanation: "The image primarily depicts a natural scene."
          },
          {
            question: "Which colors are dominant in the image?",
            options: ["Red and Orange", "Blue and Green", "Black and White", "Yellow and Purple"],
            correct: 1,
            explanation: "Blue and green are the most prominent colors."
          },
          {
            question: "What is the overall mood of the image?",
            options: ["Calm", "Exciting", "Sad", "Mysterious"],
            correct: 0,
            explanation: "The image evokes a sense of calmness."
          }
        ]
      }

      setQuiz(generatedQuiz)
    } catch (error) {
      console.error("Error generating quiz:", error)
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black">Image Quiz Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!quiz && (
            <>
              <div className="text-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Uploaded" className="max-h-64 mx-auto rounded-md mb-4" />
                ) : (
                  <div className="border-2 border-dashed border-gray-400 rounded-md p-6 mb-4">
                    <Upload className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-500">Upload an image to generate a quiz</p>
                  </div>
                )}
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                <label htmlFor="image-upload">
                  <Button variant="secondary" asChild>
                    <span className="flex items-center">
                      <Upload className="w-4 h-4 mr-2" />
                      {imageFile ? 'Change Image' : 'Upload Image'}
                    </span>
                  </Button>
                </label>
              </div>

              <Button className="w-full bg-black text-white hover:bg-gray-800" onClick={generateQuiz} disabled={isUploading || !imageFile}>
                {isUploading ? (
                  <span className="flex items-center">
                    Generating Quiz...
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  </span>
                ) : 'Generate Quiz'}
              </Button>
            </>
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

export default ImageQuiz
