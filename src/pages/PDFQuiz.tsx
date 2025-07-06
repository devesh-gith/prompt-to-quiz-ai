
import PDFQuizHeader from '@/components/PDFQuizHeader'
import PDFQuizUpload from '@/components/PDFQuizUpload'
import QuizDisplay from '@/components/QuizDisplay'
import ShareToPoolButton from '@/components/ShareToPoolButton'
import { usePDFQuizGeneration } from '@/hooks/usePDFQuizGeneration'

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
              <ShareToPoolButton
                quizData={quiz}
                quizType="pdf"
                title={`PDF Quiz - ${selectedFile?.name || 'Generated'}`}
                description="Quiz generated from PDF document"
              />
            </div>
          </div>
        </div>
        <QuizDisplay quiz={quiz} onBackToList={resetQuiz} />
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
