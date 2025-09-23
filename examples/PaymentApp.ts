import { updateUser, deleteUser } from './PaymentService'

// Only uses PaymentService functions
const paymentUser = updateUser({ id: '1', name: 'Payer', paymentMethod: 'card' }, { paymentMethod: 'paypal' })
deleteUser('payer123')
console.log(paymentUser)
