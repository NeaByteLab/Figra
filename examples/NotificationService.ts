export interface User {
  id: string
  name: string
  preferences: string[]
}

export function createUser(userData: Partial<User>): User {
  return {
    id: Math.random().toString(36),
    name: userData.name ?? '',
    preferences: userData.preferences ?? []
  }
}

export function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates }
}

export function deleteUser(userId: string): boolean {
  console.log(`Unsubscribing user ${userId}`)
  return true
}
