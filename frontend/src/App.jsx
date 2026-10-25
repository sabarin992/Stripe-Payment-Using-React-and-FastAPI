
import { useState } from "react";

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/payments/mock",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: 200 }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Payment request failed");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      maxWidth: "420px",
      margin: "80px auto",
      padding: "24px",
      fontFamily: "Arial, sans-serif",
      border: "1px solid #ddd",
      borderRadius: "16px",
    }}>
      <h1>Payment Demo</h1>
      <p>Practice payment integration with React and FastAPI.</p>

      <h2>Ride Payment: ₹200</h2>

      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          padding: "12px 20px",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "Processing..." : "Pay ₹200"}
      </button>

      {result && (
        <section>
          <h3>Payment result</h3>
          <p>Status: {result.status}</p>
          <p>Amount: ₹{result.amount}</p>
          <p>Payment ID: {result.payment_id}</p>
          <p>{result.message}</p>
        </section>
      )}

      {error && <p role="alert">{error}</p>}
    </main>
  );
}

export default App;
