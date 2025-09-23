import { createUser, updateUser } from './CacheService'

// Only uses CacheService functions
const cacheUser = createUser({ name: 'Cacher', cacheKey: 'user123' })
const updatedCacheUser = updateUser(cacheUser, { cacheKey: 'user456' })
console.log(cacheUser, updatedCacheUser)
