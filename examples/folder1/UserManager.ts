export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

export class UserManager {
  private users: User[] = []

  addUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      id: Math.random().toString(36),
      name: user.name,
      email: user.email,
      createdAt: new Date()
    }
    this.users.push(newUser)
    return newUser
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id)
  }

  getAllUsers(): User[] {
    return [...this.users]
  }
}

export const defaultUserManager = new UserManager()

export function createUserManager(): UserManager {
  return new UserManager()
}
