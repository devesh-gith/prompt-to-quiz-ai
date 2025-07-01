
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Image, Youtube, FileText, MessageSquare, Sparkles, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import RecentQuizResults from '@/components/RecentQuizResults'

const DashboardHome = () => {
  const navigate = useNavigate()

  const quizTypes = [
    {
      icon: Image,
      title: "Image to Quiz",
      description: "Upload an image and generate quiz questions",
      color: "from-blue-500 to-cyan-500",
      path: "/dashboard/image-quiz"
    },
    {
      icon: Youtube,
      title: "YouTube to Quiz",
      description: "Convert YouTube videos to quizzes",
      color: "from-red-500 to-pink-500",
      path: "/dashboard/youtube-quiz"
    },
    {
      icon: FileText,
      title: "PDF to Quiz",
      description: "Extract quiz questions from PDF documents",
      color: "from-green-500 to-emerald-500",
      path: "/dashboard/pdf-quiz"
    },
    {
      icon: MessageSquare,
      title: "Text to Quiz",
      description: "Generate quizzes from any text content",
      color: "from-purple-500 to-violet-500",
      path: "/dashboard/text-quiz"
    },
    {
      icon: Sparkles,
      title: "Prompt to Quiz",
      description: "Create quizzes using AI prompts",
      color: "from-orange-500 to-yellow-500",
      path: "/dashboard/prompt-quiz"
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Create Your Quiz</h1>
        <p className="text-gray-600">Choose how you'd like to generate your quiz questions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {quizTypes.map((type, index) => (
          <Card 
            key={index} 
            className="relative overflow-hidden border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            onClick={() => navigate(type.path)}
          >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${type.color}`} />
            <CardHeader className="pb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <type.icon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-black flex items-center justify-between">
                {type.title}
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{type.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Quiz Results Section */}
      <div className="mb-8">
        <RecentQuizResults />
      </div>
    </div>
  )
}

export default DashboardHome
