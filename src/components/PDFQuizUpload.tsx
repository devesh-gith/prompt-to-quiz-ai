
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PDFQuizUploadProps {
  selectedFile: File | null
  questionCount: number
  isGenerating: boolean
  onFileChange: (file: File | null) => void
  onQuestionCountChange: (count: number) => void
  onGenerateQuiz: () => void
}

const PDFQuizUpload = ({
  selectedFile,
  questionCount,
  isGenerating,
  onFileChange,
  onQuestionCountChange,
  onGenerateQuiz
}: PDFQuizUploadProps) => {
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

    onFileChange(file)
  }

  return (
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
              onChange={(e) => onQuestionCountChange(Number(e.target.value))}
              className="w-32"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quiz Settings</p>
              <p className="text-xs text-gray-500">Configure your quiz parameters</p>
            </div>
            <Button 
              onClick={onGenerateQuiz}
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
  )
}

export default PDFQuizUpload
