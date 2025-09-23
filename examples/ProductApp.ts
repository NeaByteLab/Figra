import { createUser, updateUser } from './ProductService'

// Only uses ProductService functions
const productUser = createUser({ name: 'Jane', role: 'admin' })
const updatedProductUser = updateUser(productUser, { role: 'superadmin' })
console.log(productUser, updatedProductUser)
