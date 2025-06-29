
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PDFQuizHeaderProps {
  title: string
  subtitle: string
  selectedFileName?: string
  showResetButton?: boolean
  onReset?: () => void
}

const PDFQuizHeader = ({ 
  title, 
  subtitle, 
  selectedFileName, 
  showResetButton = false, 
  onReset 
}: PDFQuizHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">{title}</h1>
            <p className="text-gray-600">
              {selectedFileName ? `Quiz generated from: ${selectedFileName}` : subtitle}
            </p>
          </div>
        </div>
        {showResetButton && onReset && (
          <Button onClick={onReset} variant="outline">
            Generate New Quiz
          </Button>
        )}
      </div>
    </div>
  )
}

export default PDFQuizHeader
