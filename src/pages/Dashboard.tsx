
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { Outlet } from 'react-router-dom'
import { OrganizationSwitcher } from '@clerk/clerk-react'

const Dashboard = () => {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen font-poppins">Loading...</div>
  }

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gray-50 font-poppins">
            <AppSidebar />
            <main className="flex-1">
              <header className="bg-white border-b border-gray-200">
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Q</span>
                      </div>
                      <span className="text-xl font-bold text-black">QuizAI Dashboard</span>
                    </div>
                    <OrganizationSwitcher
                      appearance={{
                        elements: {
                          organizationSwitcherTrigger: "border border-gray-300 rounded-md px-3 py-2 text-sm",
                          organizationSwitcherPopoverCard: "shadow-lg",
                        }
                      }}
                      createOrganizationMode="modal"
                      organizationProfileMode="modal"
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    Welcome back, {user?.firstName || 'User'}!
                  </div>
                </div>
              </header>
              <div className="p-6">
                <Outlet />
              </div>
            </main>
          </div>
        </SidebarProvider>
      </SignedIn>
    </>
  )
}

export default Dashboard
