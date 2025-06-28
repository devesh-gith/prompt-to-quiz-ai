
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Image, Youtube, FileText, MessageSquare, Sparkles } from 'lucide-react'

const FeaturesSection = () => {
  const features = [
    {
      icon: Image,
      title: "Image to Quiz",
      description: "Upload any image and our AI will analyze it to create relevant quiz questions using Google Vision API.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Youtube,
      title: "YouTube to Quiz",
      description: "Transform YouTube videos into comprehensive quizzes by analyzing audio content with Assembly API.",
      gradient: "from-red-500 to-pink-500"
    },
    {
      icon: FileText,
      title: "PDF to Quiz",
      description: "Extract text from PDFs and automatically generate quiz questions based on the content.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: MessageSquare,
      title: "Text to Quiz",
      description: "Paste any text content and get instant quiz generation with customizable difficulty levels.",
      gradient: "from-purple-500 to-violet-500"
    },
    {
      icon: Sparkles,
      title: "Prompt to Quiz",
      description: "Simply describe what you want to quiz about and let our AI create targeted questions.",
      gradient: "from-orange-500 to-yellow-500"
    }
  ]

  return (
    <section id="features" className="py-20 feature-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Powerful AI-Driven Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our advanced AI capabilities make quiz creation effortless, no matter your source material.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient}`} />
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-black">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
