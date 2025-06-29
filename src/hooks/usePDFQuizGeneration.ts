
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

export const usePDFQuizGeneration = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [questionCount, setQuestionCount] = useState(5)
  const [quiz, setQuiz] = useState<any>(null)
  const { toast } = useToast()

  const handleFileChange = (file: File | null) => {
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

  return {
    selectedFile,
    isGenerating,
    questionCount,
    quiz,
    handleFileChange,
    setQuestionCount,
    handleGenerateQuiz,
    resetQuiz
  }
}
