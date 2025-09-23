export interface User {
  id: string
  name: string
  paymentMethod: string
}

export function createUser(userData: Partial<User>): User {
  return {
    id: Math.random().toString(36),
    name: userData.name ?? '',
    paymentMethod: userData.paymentMethod ?? ''
  }
}

export function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates }
}

export function deleteUser(userId: string): boolean {
  console.log(`Refunding user ${userId}`)
  return true
}
