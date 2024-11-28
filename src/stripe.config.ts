// stripeConfig.ts
import Stripe from 'stripe'

// Ensure the environment variable is defined
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set')
}

// Initialize the Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia' // Ensure this matches the API version you're using
})

export default stripe
