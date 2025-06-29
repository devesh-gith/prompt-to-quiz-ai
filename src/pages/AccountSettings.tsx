
import { useUser } from '@clerk/clerk-react'
import { UserProfile } from '@clerk/clerk-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const AccountSettings = () => {
  const { user } = useUser()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your account preferences and profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Overview */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black">Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900">{user?.fullName || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Member since</label>
              <p className="text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black">Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-700">Quizzes Created</span>
              <span className="font-semibold text-black">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Total Questions</span>
              <span className="font-semibold text-black">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Plan</span>
              <span className="font-semibold text-black">Free</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clerk User Profile Component */}
      <div className="mt-8">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black">Manage Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <UserProfile 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-none",
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AccountSettings
