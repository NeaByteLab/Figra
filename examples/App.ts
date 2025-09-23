import { createUser, updateUser } from './UserService'

// Only uses UserService functions
const user = createUser({ name: 'John', email: 'john@example.com' })
const updatedUser = updateUser(user, { email: 'john.doe@example.com' })
console.log(user, updatedUser)
