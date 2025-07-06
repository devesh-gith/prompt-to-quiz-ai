
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import SocialProof from '@/components/SocialProof'
import Pricing from '@/components/Pricing'
import FinalCTA from '@/components/FinalCTA'
import Header from '@/components/Header'

const Index = () => {
  console.log("QuizGenius AI landing page rendering...");
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <SocialProof />
      <Pricing />
      <FinalCTA />
      
      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">Q</span>
            </div>
            <span className="text-2xl font-bold">QuizGenius AI</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 QuizGenius AI. All rights reserved. Transform any content into engaging quizzes with AI.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Index
