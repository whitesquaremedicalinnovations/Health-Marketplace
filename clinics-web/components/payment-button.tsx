'use client'

import {Button} from "@/components/ui/button"
import { axiosInstance } from "@/lib/axios";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentButton({
  amount, 
  currency, 
  receipt, 
  name, 
  email, 
  phone, 
  userType, 
  setHasEmailPaid
}: {
  amount: number;
  currency: string;
  receipt: string;
  name: string;
  email: string;
  phone: string;
  userType: string;
  setHasEmailPaid: (hasEmailPaid: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  // Check if Razorpay script is loaded
  useEffect(() => {
    const checkRazorpayScript = () => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        setIsScriptLoaded(true);
        setScriptError(false);
      } else {
        // Wait a bit and check again
        const checkInterval = setInterval(() => {
          if (typeof window !== 'undefined' && window.Razorpay) {
            setIsScriptLoaded(true);
            setScriptError(false);
            clearInterval(checkInterval);
          }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!window.Razorpay) {
            setScriptError(true);
            setIsScriptLoaded(false);
          }
        }, 5000);
      }
    };

    checkRazorpayScript();
  }, []);

  const loadRazorpayScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window is not available'));
        return;
      }

      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        if (window.Razorpay) {
          setIsScriptLoaded(true);
          setScriptError(false);
          resolve();
        } else {
          reject(new Error('Razorpay script loaded but Razorpay object not found'));
        }
      };
      script.onerror = () => {
        setScriptError(true);
        setIsScriptLoaded(false);
        reject(new Error('Failed to load Razorpay script'));
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      toast.error('Payment gateway not configured. Please contact support.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Ensure Razorpay script is loaded
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay is not available. Please refresh the page.');
      }

      // Create order
      const res = await axiosInstance.post("/api/payments", {
        amount: amount,
        currency: currency,
        receipt: receipt,
        email: email,
        userType: userType,
      });

      const order = res.data;
      
      if (!order || !order.id) {
        throw new Error('Failed to create payment order');
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "DentalIcons",
        description: receipt,
        order_id: order.id,
        image: "/logo.png",
        prefill: {
          name: name || '',
          email: email || '',
          contact: phone || '',
        },
        theme: {
          color: "#2563eb",
        },
        handler: async (response: any) => {
          try {
            setIsLoading(true);
            const verifyResponse = await axiosInstance.post("/api/payments/verify", {
              orderId: order.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            
            const json = verifyResponse.data;
            toast.success(json.message || "Payment successful!");
            setHasEmailPaid(true);
          } catch (error: any) {
            console.error("Payment verification error:", error);
            toast.error(error.response?.data?.message || "Payment verification failed");
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response: any) {
        console.error("Payment failed:", response);
        toast.error(response.error?.description || "Payment failed. Please try again.");
        setIsLoading(false);
      });

      razorpay.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to initialize payment. Please try again.");
      setIsLoading(false);
    }
  };

  if (scriptError) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">Payment gateway unavailable. Please refresh the page or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading || !isScriptLoaded}
      className={`
        flex items-center justify-center gap-2
        px-6 py-3 text-white font-semibold rounded-xl
        bg-gradient-to-br from-green-600 to-green-700 
        hover:from-green-700 hover:to-green-800
        transition-all duration-200 ease-in-out
        disabled:opacity-60 disabled:cursor-not-allowed
        shadow-md hover:shadow-lg
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Processing Payment...</span>
        </>
      ) : !isScriptLoaded ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading Payment Gateway...</span>
        </>
      ) : (
        <>
          <CreditCard className="h-5 w-5" />
          <span>Pay {currency} {amount} Securely and get started</span>
        </>
      )}
    </Button>
  );
}