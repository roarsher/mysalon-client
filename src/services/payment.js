// import { createOrder, verifyPayment } from './api';

// /**
//  * loadRazorpayScript
//  * ------------------
//  * Dynamically loads the Razorpay checkout.js script.
//  * We load it on demand (not in index.html) so it only loads when needed.
//  * Returns a promise that resolves true/false based on load success.
//  */
// export const loadRazorpayScript = () => {
//   return new Promise((resolve) => {
//     // Already loaded
//     if (window.Razorpay) { resolve(true); return; }

//     const script    = document.createElement('script');
//     script.src      = 'https://checkout.razorpay.com/v1/checkout.js';
//     script.onload   = () => resolve(true);
//     script.onerror  = () => resolve(false);
//     document.body.appendChild(script);
//   });
// };

// /**
//  * initiateRazorpayPayment
//  * -----------------------
//  * Full payment flow in one function:
//  *   1. Load Razorpay script
//  *   2. Call backend to create a Razorpay order
//  *   3. Open the Razorpay modal
//  *   4. On payment success → verify with backend
//  *   5. Return result to caller
//  *
//  * @param {string}   bookingId  - MongoDB booking _id
//  * @param {Function} onSuccess  - called with payment data after verification
//  * @param {Function} onFailure  - called with error message if payment fails
//  */
// export const initiateRazorpayPayment = async (bookingId, onSuccess, onFailure) => {
//   try {
//     // ── Step 1: Load Razorpay script ────────────────────────────────────
//     const scriptLoaded = await loadRazorpayScript();
//     if (!scriptLoaded) {
//       onFailure('Could not load payment gateway. Check your internet connection.');
//       return;
//     }

//     // ── Step 2: Create order on backend ──────────────────────────────────
//     const res       = await createOrder({ bookingId });
//     const orderData = res.data.data;

//     // ── Step 3: Configure Razorpay modal ─────────────────────────────────
//     const options = {
//       key:         orderData.key,          // Razorpay publishable key
//       amount:      orderData.amount,       // in paise
//       currency:    orderData.currency,
//       name:        orderData.name,
//       description: orderData.description,
//       order_id:    orderData.orderId,

//       // Pre-fill customer details
//       prefill: {
//         name:    orderData.prefill.name,
//         email:   orderData.prefill.email,
//         contact: orderData.prefill.contact,
//       },

//       // Branding
//       theme: { color: '#534AB7' },

//       // ── Called when payment is successful ─────────────────────────────
//       handler: async (response) => {
//         try {
//           // Step 4: Verify payment on backend
//           const verifyRes = await verifyPayment({
//             razorpay_order_id:   response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature:  response.razorpay_signature,
//             bookingId,
//           });
//           onSuccess(verifyRes.data.data);
//         } catch (err) {
//           onFailure(err.message || 'Payment verification failed. Contact support.');
//         }
//       },

//       // ── Called when user closes the modal ─────────────────────────────
//       modal: {
//         ondismiss: () => {
//           onFailure('Payment cancelled. You can try again from your bookings.');
//         },
//       },
//     };

//     // ── Step 4: Open the modal ────────────────────────────────────────────
//     const rzp = new window.Razorpay(options);

//     // Handle payment failures inside the modal (wrong card, insufficient funds etc.)
//     rzp.on('payment.failed', (response) => {
//       onFailure(
//         response.error?.description ||
//         response.error?.reason      ||
//         'Payment failed. Please try a different payment method.'
//       );
//     });

//     rzp.open();
//   } catch (err) {
//     onFailure(err.message || 'Could not initiate payment. Please try again.');
//   }
// };
import { createOrder as apiCreateOrder, verifyPayment as apiVerifyPayment } from './api';

/**
 * loadRazorpayScript
 * Dynamically loads checkout.js only when needed
 */
export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s  = document.createElement('script');
    s.src    = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror= () => resolve(false);
    document.body.appendChild(s);
  });

/**
 * initiateRazorpayPayment
 * Full payment flow: create order → open modal → verify
 */
export const initiateRazorpayPayment = async (bookingId, onSuccess, onFailure) => {
  try {
    // 1. Load script
    const loaded = await loadRazorpayScript();
    if (!loaded) { onFailure('Could not load payment gateway. Check your connection.'); return; }

    // 2. Create order on backend
    let orderData;
    try {
      const res = await apiCreateOrder({ bookingId });
      orderData = res.data.data;
    } catch (err) {
      onFailure(err?.response?.data?.message || err.message || 'Could not create payment order.');
      return;
    }

    // 3. Open Razorpay modal
    const options = {
      key:         orderData.key,
      amount:      orderData.amount,
      currency:    orderData.currency || 'INR',
      name:        'MYSALON',
      description: orderData.description,
      order_id:    orderData.orderId,
      prefill:     orderData.prefill || {},
      theme:       { color: '#534AB7' },

      handler: async (response) => {
        try {
          const verifyRes = await apiVerifyPayment({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            bookingId,
          });
          onSuccess(verifyRes.data.data);
        } catch (err) {
          onFailure(err?.response?.data?.message || 'Payment verification failed. Contact support.');
        }
      },

      modal: {
        ondismiss: () => onFailure('Payment cancelled.'),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (r) => {
      onFailure(r.error?.description || r.error?.reason || 'Payment failed.');
    });
    rzp.open();
  } catch (err) {
    onFailure(err.message || 'Could not open payment gateway.');
  }
};
