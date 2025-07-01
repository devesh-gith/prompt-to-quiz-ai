
import { useOrganizationList, useUser } from '@clerk/clerk-react'

export const useOrganizationRole = () => {
  const { user } = useUser()
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  })

  // Get the current organization membership
  const getCurrentOrganizationRole = (organizationId: string) => {
    if (!isLoaded || !userMemberships?.data) {
      return { role: null, isLoading: true, isAdmin: false }
    }

    const currentMembership = userMemberships.data.find(
      (membership) => membership.organization.id === organizationId
    )

    if (!currentMembership) {
      return { role: null, isLoading: false, isAdmin: false }
    }

    const role = currentMembership.role
    const isAdmin = role === 'org:admin'

    return {
      role,
      isLoading: false,
      isAdmin,
      isMember: role === 'org:member',
    }
  }

  return {
    getCurrentOrganizationRole,
    isLoading: !isLoaded
  }
}
