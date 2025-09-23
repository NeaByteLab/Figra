export interface User {
  id: string
  name: string
  role: string
}

export function createUser(userData: Partial<User>): User {
  return {
    id: Math.random().toString(36),
    name: userData.name ?? '',
    role: userData.role ?? 'customer'
  }
}

export function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates }
}

export function deleteUser(userId: string): boolean {
  console.log(`Removing user ${userId} from products`)
  return true
}
