import mascotCharm from '~/assets/maskot/Head/charm.png'
import mascotOri from '~/assets/maskot/Head/ori.png'
import mascotCitizen from '~/assets/maskot/Head/citizen.png'

/**
 * Returns the appropriate Kreavoks mascot head image based on role name.
 * - Admin roles -> charm
 * - Mentor roles -> ori
 * - Intern & others -> citizen
 */
export const getRoleMascot = (roleName?: string): string => {
  const norm = (roleName || '').toUpperCase()
  if (norm.includes('ADMIN')) return mascotCharm
  if (norm.includes('MENTOR')) return mascotOri
  return mascotCitizen
}
