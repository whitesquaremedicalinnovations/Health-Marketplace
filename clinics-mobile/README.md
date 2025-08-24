# Clinics Mobile App

## Environment Variables Setup

To use the Razorpay payment integration, you need to set up the following environment variables:

### Required Environment Variables

1. **EXPO_PUBLIC_API_URL**: Your backend API URL
   ```
   EXPO_PUBLIC_API_URL=http://localhost:3000
   ```

2. **EXPO_PUBLIC_RAZORPAY_KEY_ID**: Your Razorpay public key ID
   ```
   EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
   ```

### Setting up Environment Variables

1. Create a `.env` file in the root directory of the clinics-mobile project
2. Add the environment variables above
3. For production, use your live Razorpay keys instead of test keys

### Backend Environment Variables

Make sure your backend has these environment variables set:
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Razorpay public key ID
- `RAZORPAY_KEY_SECRET`: Razorpay secret key
- `RAZORPAY_WEBHOOK_SECRET`: Razorpay webhook secret (for webhook verification)

## Payment Flow

The app now includes a complete Razorpay payment integration for clinic onboarding:

1. User fills clinic details in onboarding
2. Clicks "Pay" button to initiate payment
3. Razorpay WebView opens with payment form
4. User completes payment
5. Payment is verified on backend
6. User can complete registration

## Development

```bash
npm install
npx expo start
```

## Building

```bash
npx expo build:android
npx expo build:ios
```
