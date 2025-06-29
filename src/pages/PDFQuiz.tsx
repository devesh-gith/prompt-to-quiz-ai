
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Upload, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import QuizDisplay from '@/components/QuizDisplay'

const PDFQuiz = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [questionCount, setQuestionCount] = useState(5)
  const [quiz, setQuiz] = useState<any>(null)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please select a PDF file smaller than 10MB.",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
    setQuiz(null)
  }

  const handleGenerateQuiz = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file first.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    
    try {
      // Convert file to base64
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1]) // Remove data:application/pdf;base64, prefix
        }
        reader.onerror = reject
        reader.readAsDataURL(selectedFile)
      })

      console.log('Calling generate-pdf-quiz function...')
      
      const { data, error } = await supabase.functions.invoke('generate-pdf-quiz', {
        body: {
          pdfData: fileBase64,
          questionCount: questionCount
        }
      })

      if (error) {
        console.error('Supabase function error:', error)
        throw new Error(error.message || 'Failed to generate quiz')
      }

      if (!data || !data.questions) {
        throw new Error('No quiz data received')
      }

      setQuiz(data)
      toast({
        title: "Quiz generated successfully!",
        description: `Generated ${data.questions.length} questions from your PDF.`,
      })

    } catch (error) {
      console.error('Error generating quiz:', error)
      toast({
        title: "Error generating quiz",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const resetQuiz = () => {
    setQuiz(null)
    setSelectedFile(null)
  }

  if (quiz) {
    return (
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">PDF Quiz Results</h1>
                <p className="text-gray-600">Quiz generated from: {selectedFile?.name}</p>
              </div>
            </div>
            <Button onClick={resetQuiz} variant="outline">
              Generate New Quiz
            </Button>
          </div>
        </div>
        <QuizDisplay quiz={quiz} onRestart={resetQuiz} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">PDF to Quiz</h1>
            <p className="text-gray-600">Extract quiz questions from PDF documents</p>
          </div>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-black">Upload PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Drag and drop a PDF here, or click to browse</p>
            <p className="text-sm text-gray-500 mb-4">Maximum file size: 10MB</p>
            
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
            />
            <Label htmlFor="pdf-upload" className="cursor-pointer">
              <Button className="bg-black text-white hover:bg-gray-800" asChild>
                <span>Choose PDF</span>
              </Button>
            </Label>
            
            {selectedFile && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  Selected: <span className="font-medium">{selectedFile.name}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="question-count">Number of Questions</Label>
              <Input
                id="question-count"
                type="number"
                min="1"
                max="20"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-32"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Quiz Settings</p>
                <p className="text-xs text-gray-500">Configure your quiz parameters</p>
              </div>
              <Button 
                onClick={handleGenerateQuiz}
                disabled={!selectedFile || isGenerating}
                className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  'Generate Quiz'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PDFQuiz
