import { updateUser } from './NotificationService'

// Only uses NotificationService function
const notifyUser = updateUser({ id: '1', name: 'Test', preferences: [] }, { preferences: ['email'] })
console.log(notifyUser)
