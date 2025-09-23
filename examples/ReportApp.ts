import { createUser } from './ReportService'

// Only uses ReportService function
const reportUser = createUser({ name: 'Reporter', department: 'Analytics' })
console.log(reportUser)
