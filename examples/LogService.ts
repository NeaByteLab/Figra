export interface User {
  id: string
  name: string
  logLevel: string
}

export function createUser(userData: Partial<User>): User {
  return {
    id: Math.random().toString(36),
    name: userData.name ?? '',
    logLevel: userData.logLevel ?? 'info'
  }
}

export function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates }
}

export function deleteUser(userId: string): boolean {
  console.log(`Clearing logs for user ${userId}`)
  return true
}
