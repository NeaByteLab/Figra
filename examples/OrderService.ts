export interface User {
  id: string
  name: string
  address: string
}

export function createUser(userData: Partial<User>): User {
  return {
    id: Math.random().toString(36),
    name: userData.name ?? '',
    address: userData.address ?? ''
  }
}

export function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates }
}

export function deleteUser(userId: string): boolean {
  console.log(`Canceling orders for user ${userId}`)
  return true
}
