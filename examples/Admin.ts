import { createUser, deleteUser } from './AuthService'

// Only uses AuthService functions
const authUser = createUser({ username: 'admin', password: 'secret' })
deleteUser('admin123')
console.log(authUser)
