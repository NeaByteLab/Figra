export interface User {
  id: string
  name: string
  cacheKey: string
}

export function createUser(userData: Partial<User>): User {
  return {
    id: Math.random().toString(36),
    name: userData.name ?? '',
    cacheKey: userData.cacheKey ?? ''
  }
}

export function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates }
}

export function deleteUser(userId: string): boolean {
  console.log(`Invalidating cache for user ${userId}`)
  return true
}
