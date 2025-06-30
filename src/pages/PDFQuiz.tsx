
import PDFQuizHeader from '@/components/PDFQuizHeader'
import PDFQuizUpload from '@/components/PDFQuizUpload'
import QuizDisplay from '@/components/QuizDisplay'
import ShareQuizButton from '@/components/ShareQuizButton'
import { usePDFQuizGeneration } from '@/hooks/usePDFQuizGeneration'
import { useState } from 'react'

const PDFQuiz = () => {
  const {
    selectedFile,
    isGenerating,
    questionCount,
    quiz,
    handleFileChange,
    setQuestionCount,
    handleGenerateQuiz,
    resetQuiz
  } = usePDFQuizGeneration()
  
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null)

  const handleReset = () => {
    resetQuiz()
    setSavedQuizId(null)
  }

  if (quiz) {
    return (
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <PDFQuizHeader
              title="PDF Quiz Results"
              subtitle=""
              selectedFileName={selectedFile?.name}
            />
            <div className="flex items-center space-x-3">
              <ShareQuizButton
                quizId={savedQuizId}
                quizData={quiz}
                quizType="pdf"
                title={`PDF Quiz - ${selectedFile?.name || 'Generated'}`}
                description="Quiz generated from PDF document"
                onQuizSaved={setSavedQuizId}
              />
            </div>
          </div>
        </div>
        <QuizDisplay quiz={quiz} onRestart={handleReset} />
      </div>
    )
  }

  return (
    <div>
      <PDFQuizHeader
        title="PDF to Quiz"
        subtitle="Extract quiz questions from PDF documents"
      />
      
      <PDFQuizUpload
        selectedFile={selectedFile}
        questionCount={questionCount}
        isGenerating={isGenerating}
        onFileChange={handleFileChange}
        onQuestionCountChange={setQuestionCount}
        onGenerateQuiz={handleGenerateQuiz}
      />
    </div>
  )
}

export default PDFQuiz
