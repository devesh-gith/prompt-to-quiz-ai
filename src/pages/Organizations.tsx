
import { useOrganizationList, useUser } from '@clerk/clerk-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users, Settings, Crown } from 'lucide-react'
import { OrganizationProfile, CreateOrganization } from '@clerk/clerk-react'
import { useState } from 'react'

const Organizations = () => {
  const { user } = useUser()
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    }
  })
  const [showCreateOrg, setShowCreateOrg] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-64">Loading organizations...</div>
  }

  if (showCreateOrg) {
    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Create Organization</h1>
            <p className="text-gray-600">Set up a new organization to collaborate with your team</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowCreateOrg(false)}
          >
            Back to Organizations
          </Button>
        </div>
        
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <CreateOrganization 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-none",
                }
              }}
              afterCreateOrganizationUrl="/dashboard/organizations"
              skipInvitationScreen={true}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedOrgId) {
    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Manage Organization</h1>
            <p className="text-gray-600">Configure settings and manage members</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedOrgId(null)}
          >
            Back to Organizations
          </Button>
        </div>
        
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <OrganizationProfile 
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
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">My Organizations</h1>
          <p className="text-gray-600">Manage your organizations and team collaboration</p>
        </div>
        <Button 
          onClick={() => setShowCreateOrg(true)}
          className="bg-black hover:bg-gray-800 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </div>

      {userMemberships && userMemberships.data && userMemberships.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userMemberships.data.map((membership) => (
            <Card key={membership.organization.id} className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-black flex items-center">
                      {membership.organization.name}
                      {membership.role === 'admin' && (
                        <Crown className="h-4 w-4 ml-2 text-yellow-500" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600 capitalize">{membership.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Members</span>
                  <span className="font-semibold text-black">{membership.organization.membersCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created</span>
                  <span className="font-semibold text-black">
                    {new Date(membership.organization.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {membership.role === 'admin' && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedOrgId(membership.organization.id)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Organization
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-gray-200">
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-2">No Organizations Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first organization to start collaborating with your team and sharing quizzes.
            </p>
            <Button 
              onClick={() => setShowCreateOrg(true)}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Organization
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Organizations
