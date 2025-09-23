export interface User {
  id: string
  username: string
  password: string
}

export function createUser(userData: Partial<User>): User {
  return {
    id: Math.random().toString(36),
    username: userData.username ?? '',
    password: userData.password ?? ''
  }
}

export function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates }
}

export function deleteUser(userId: string): boolean {
  console.log(`Deactivating user ${userId}`)
  return true
}
