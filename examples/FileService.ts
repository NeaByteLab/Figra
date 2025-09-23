export interface User {
  id: string
  name: string
  storage: number
}

export function createUser(userData: Partial<User>): User {
  return {
    id: Math.random().toString(36),
    name: userData.name ?? '',
    storage: userData.storage ?? 0
  }
}

export function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates }
}

export function deleteUser(userId: string): boolean {
  console.log(`Cleaning up files for user ${userId}`)
  return true
}
