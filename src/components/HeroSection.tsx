
import { SignedOut, SignInButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

const HeroSection = () => {
  return (
    <section className="hero-gradient min-h-screen flex items-center justify-center pt-20">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">AI-Powered Quiz Generation</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-6 leading-tight">
            Create Quizzes from
            <span className="gradient-text block">Anything, Instantly</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform images, videos, PDFs, text, or simple prompts into engaging quizzes using advanced AI. 
            Perfect for educators, trainers, and content creators.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <SignedOut>
              <SignInButton fallbackRedirectUrl="/dashboard" mode="modal">
                <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg font-semibold rounded-xl">
                  Start Creating Quizzes
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </SignInButton>
            </SignedOut>
            <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg rounded-xl">
              Watch Demo
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-3xl mx-auto">
            {[
              { icon: "📷", label: "Images" },
              { icon: "🎥", label: "YouTube" },
              { icon: "📄", label: "PDFs" },
              { icon: "📝", label: "Text" },
              { icon: "💡", label: "Prompts" }
            ].map((item, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:bg-white/80 transition-all duration-300">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
