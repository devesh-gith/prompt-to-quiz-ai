
import { SignIn, SignUp } from '@clerk/clerk-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const { isSignedIn, isLoaded } = useUser()
  const navigate = useNavigate()

  // Redirect to dashboard if user is already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/dashboard')
    }
  }, [isSignedIn, isLoaded, navigate])

  // Don't render anything while checking auth state
  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Don't render auth forms if user is signed in (will redirect)
  if (isSignedIn) {
    return <div className="flex items-center justify-center min-h-screen">Redirecting to dashboard...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">Q</span>
            </div>
            <span className="text-3xl font-bold text-black">QuizAI</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="text-gray-600">
            {isSignUp ? 'Join QuizAI to create amazing quizzes' : 'Welcome back to QuizAI'}
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {isSignUp ? (
            <SignUp 
              fallbackRedirectUrl="/dashboard"
              forceRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-none",
                  footer: "hidden",
                  formButtonPrimary: "bg-black hover:bg-gray-800 text-white",
                  logoBox: "hidden",
                  headerTitle: "text-2xl font-bold text-gray-900",
                  headerSubtitle: "text-gray-600",
                }
              }}
            />
          ) : (
            <SignIn 
              fallbackRedirectUrl="/dashboard"
              forceRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-none",
                  footer: "hidden",
                  formButtonPrimary: "bg-black hover:bg-gray-800 text-white",
                  logoBox: "hidden",
                  headerTitle: "text-2xl font-bold text-gray-900",
                  headerSubtitle: "text-gray-600",
                }
              }}
            />
          )}
          
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth
