
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Image, Youtube, FileText, MessageSquare, Sparkles, Plus } from 'lucide-react'

const Dashboard = () => {
  const { user } = useUser()

  const quizTypes = [
    {
      icon: Image,
      title: "Image to Quiz",
      description: "Upload an image and generate quiz questions",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Youtube,
      title: "YouTube to Quiz",
      description: "Convert YouTube videos to quizzes",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: FileText,
      title: "PDF to Quiz",
      description: "Extract quiz questions from PDF documents",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: MessageSquare,
      title: "Text to Quiz",
      description: "Generate quizzes from any text content",
      color: "from-purple-500 to-violet-500"
    },
    {
      icon: Sparkles,
      title: "Prompt to Quiz",
      description: "Create quizzes using AI prompts",
      color: "from-orange-500 to-yellow-500"
    }
  ]

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Q</span>
                </div>
                <span className="text-xl font-bold text-black">QuizAI Dashboard</span>
              </div>
              <div className="text-sm text-gray-600">
                Welcome back, {user?.firstName || 'User'}!
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">Create Your Quiz</h1>
              <p className="text-gray-600">Choose how you'd like to generate your quiz questions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizTypes.map((type, index) => (
                <Card key={index} className="relative overflow-hidden border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
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

            <div className="mt-12">
              <h2 className="text-2xl font-bold text-black mb-6">Recent Quizzes</h2>
              <Card className="border-gray-200">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500 mb-4">No quizzes created yet</p>
                  <Button className="bg-black text-white hover:bg-gray-800">
                    Create Your First Quiz
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SignedIn>
    </>
  )
}

export default Dashboard
