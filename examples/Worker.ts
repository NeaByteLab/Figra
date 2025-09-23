import { createUser } from './FileService'

const fileUser = createUser({ name: 'Worker', storage: 1024 })
console.log(fileUser)