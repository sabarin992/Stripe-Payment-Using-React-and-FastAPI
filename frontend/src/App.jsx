
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setMessage("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-result`,
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "Payment failed");
    } else if (paymentIntent?.status === "succeeded") {
      setMessage("Test payment succeeded!");
    } else if (paymentIntent) {
      setMessage(`Payment status: ${paymentIntent.status}`);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />

      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        style={{ marginTop: "20px", padding: "12px 20px" }}
      >
        {loading ? "Processing..." : "Pay $2.00"}
      </button>

      {message && <p role="status">{message}</p>}
    </form>
  );
}

function App() {
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function createPaymentIntent() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/payments/create-intent",
          { method: "POST" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Could not create payment");
        }

        if (!cancelled) {
          setClientSecret(data.client_secret);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    createPaymentIntent();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p>Preparing payment...</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!clientSecret) return <p>Payment could not be initialized.</p>;

  return (
    <main
      style={{
        maxWidth: "480px",
        margin: "60px auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        border: "1px solid #ddd",
        borderRadius: "16px",
      }}
    >
      <h1>Stripe Test Payment</h1>
      <p>Demo purchase: $2.00 USD</p>

      <Elements
        stripe={stripePromise}
        options={{ clientSecret }}
      >
        <CheckoutForm />
      </Elements>
    </main>
  );
}

export default App;
