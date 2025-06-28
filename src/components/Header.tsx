
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">Q</span>
          </div>
          <span className="text-xl font-bold text-black">QuizAI</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-600 hover:text-black transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-gray-600 hover:text-black transition-colors">
            Pricing
          </a>
          <a href="#about" className="text-gray-600 hover:text-black transition-colors">
            About
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <SignedOut>
            <SignInButton fallbackRedirectUrl="/dashboard">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Sign In
              </Button>
            </SignInButton>
            <SignInButton fallbackRedirectUrl="/dashboard" mode="modal">
              <Button className="bg-black text-white hover:bg-gray-800">
                Get Started
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Button 
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}

export default Header
