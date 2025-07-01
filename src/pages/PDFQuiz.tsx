import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { FileText, Upload, Loader2 } from 'lucide-react'
import LocalQuizDisplay from '@/components/LocalQuizDisplay'

const PDFQuiz = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [quiz, setQuiz] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleRestart = () => {
    setQuiz(null)
    setPdfFile(null)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
    } else {
      setPdfFile(null)
      toast({
        title: "Error",
        description: "Please upload a valid PDF file.",
        variant: "destructive",
      })
    }
  }

  const generateQuiz = async () => {
    if (!pdfFile) {
      toast({
        title: "Error",
        description: "Please upload a PDF file first.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('pdf', pdfFile)

      const response = await fetch('/api/generate-quiz/pdf', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Failed to generate quiz: ${response.statusText}`)
      }

      const data = await response.json()
      setQuiz(data)
    } catch (error: any) {
      console.error("PDF Quiz Generation Error:", error)
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
          <CardTitle className="text-2xl font-bold text-black">
            PDF Quiz Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!quiz && (
            <>
              <p className="text-gray-600">
                Upload a PDF file to automatically generate a quiz.
              </p>
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  id="pdf-upload"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                />
                <Button
                  asChild
                  variant="outline"
                  className="border-gray-300"
                  disabled={isUploading}
                >
                  <label htmlFor="pdf-upload" className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>{pdfFile ? pdfFile.name : 'Upload PDF'}</span>
                  </label>
                </Button>
                <Button
                  onClick={generateQuiz}
                  className="bg-black text-white hover:bg-gray-800"
                  disabled={!pdfFile || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Quiz'
                  )}
                </Button>
              </div>
            </>
          )}
          {quiz ? (
            <LocalQuizDisplay quiz={quiz} onRestart={handleRestart} />
          ) : (
            pdfFile && (
              <div className="text-center mt-4">
                <FileText className="mx-auto h-10 w-10 text-gray-500" />
                <p className="text-sm text-gray-500">
                  Selected File: {pdfFile.name}
                </p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PDFQuiz
