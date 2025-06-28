
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Image, Upload } from 'lucide-react'

const ImageQuiz = () => {
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
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Drag and drop an image here, or click to browse</p>
            <p className="text-sm text-gray-500">Supports JPG, PNG, GIF files</p>
            <Button className="mt-4 bg-black text-white hover:bg-gray-800">
              Choose Image
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quiz Settings</p>
              <p className="text-xs text-gray-500">Configure your quiz parameters</p>
            </div>
            <Button disabled className="bg-gray-300 text-gray-500">
              Generate Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ImageQuiz
