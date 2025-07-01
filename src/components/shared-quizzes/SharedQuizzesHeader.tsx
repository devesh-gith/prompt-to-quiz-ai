
import { useOrganization } from '@clerk/clerk-react'
import { Building, Shield } from 'lucide-react'

interface SharedQuizzesHeaderProps {
  isAdmin: boolean
}

const SharedQuizzesHeader = ({ isAdmin }: SharedQuizzesHeaderProps) => {
  const { organization } = useOrganization()

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-black mb-2">Organization Quiz Pool</h1>
      <p className="text-gray-600">
        Professional quizzes shared by your organization (automatically expire after 1 hour)
      </p>
      {organization && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Organization: <span className="font-semibold text-black">{organization.name}</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className={`h-4 w-4 ${isAdmin ? 'text-black' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${isAdmin ? 'text-black' : 'text-gray-600'}`}>
              Role: {isAdmin ? 'Admin' : 'Member'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SharedQuizzesHeader
