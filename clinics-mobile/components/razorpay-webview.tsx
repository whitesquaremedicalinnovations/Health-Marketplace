import React, { useRef, useState } from 'react';
import { View, Modal, Alert, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useThemeColor } from '@/hooks/useThemeColor';

interface RazorpayWebViewProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: (paymentId: string, signature: string) => void;
  onPaymentError: (error: string) => void;
  orderId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
}

export default function RazorpayWebView({
  visible,
  onClose,
  onPaymentSuccess,
  onPaymentError,
  orderId,
  amount,
  currency,
  customerName,
  customerEmail,
  customerPhone,
  description
}: RazorpayWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const backgroundColor = useThemeColor({}, 'background');

  // Razorpay configuration
  const razorpayConfig = {
    key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE',
    amount: amount * 100, // Razorpay expects amount in paise
    currency: currency,
    name: 'Make My Look',
    description: description,
    order_id: orderId,
    prefill: {
      name: customerName,
      email: customerEmail,
      contact: customerPhone
    },
    theme: {
      color: '#000000'
    }
  };

  // HTML content for Razorpay checkout
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #333;
          margin: 0 0 10px 0;
          font-size: 24px;
        }
        .header p {
          color: #666;
          margin: 0;
          font-size: 16px;
        }
        .payment-button {
          width: 100%;
          padding: 15px;
          background-color: #000;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .payment-button:hover {
          background-color: #333;
        }
        .payment-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .loading {
          text-align: center;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Complete Payment</h1>
          <p>Amount: ${currency} ${amount.toFixed(2)}</p>
        </div>
        
        <button id="pay-button" class="payment-button" onclick="handlePayment()">
          Pay ${currency} ${amount.toFixed(2)}
        </button>
        
        <div id="loading" class="loading" style="display: none; margin-top: 20px;">
          Processing payment...
        </div>
      </div>

      <script>
        const config = ${JSON.stringify(razorpayConfig)};
        
        function handlePayment() {
          const button = document.getElementById('pay-button');
          const loading = document.getElementById('loading');
          
          button.disabled = true;
          button.textContent = 'Processing...';
          loading.style.display = 'block';
          
          const options = {
            ...config,
            handler: function(response) {
              // Send payment success to React Native
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PAYMENT_SUCCESS',
                data: {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature
                }
              }));
            },
            modal: {
              ondismiss: function() {
                // Send payment cancelled to React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'PAYMENT_CANCELLED',
                  data: { message: 'Payment was cancelled by user' }
                }));
              }
            }
          };
          
          const rzp = new Razorpay(options);
          rzp.open();
          
          rzp.on('payment.failed', function(response) {
            // Send payment failed to React Native
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_FAILED',
              data: {
                error: response.error.description || 'Payment failed',
                code: response.error.code
              }
            }));
          });
        }
        
        // Handle page load
        window.onload = function() {
          // Notify React Native that page is loaded
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PAGE_LOADED'
          }));
        };
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'PAGE_LOADED':
          setLoading(false);
          break;
          
        case 'PAYMENT_SUCCESS':
          onPaymentSuccess(
            message.data.razorpay_payment_id,
            message.data.razorpay_signature
          );
          break;
          
        case 'PAYMENT_FAILED':
          onPaymentError(message.data.error);
          break;
          
        case 'PAYMENT_CANCELLED':
          onPaymentError('Payment was cancelled');
          break;
          
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor }}>
        {loading && (
          <View style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            zIndex: 1
          }}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        )}
        
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            onPaymentError('Failed to load payment page');
          }}
        />
      </View>
    </Modal>
  );
} 