
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from uuid import uuid4
import os
import stripe
from dotenv import load_dotenv
from fastapi import HTTPException

app = FastAPI()

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PaymentRequest(BaseModel):
    amount: int


@app.get("/")
def home():
    return {"message": "Payment Learning API is running"}


@app.post("/payments/mock")
def mock_payment(payment: PaymentRequest):
    if payment.amount <= 0:
        return {
            "status": "failed",
            "message": "Invalid payment amount",
        }

    # Simulate a payment provider response.
    return {
        "payment_id": str(uuid4()),
        "amount": payment.amount,
        "currency": "INR",
        "status": "succeeded",
        "message": "Mock payment successful",
    }

# endpoint for create payment intent
'''
This creates a PaymentIntent; it does not complete the payment yet. Don't expose the secret API key in React
'''

@app.post("/payments/create-intent")
def create_payment_intent():
    if not stripe.api_key:
        raise HTTPException(
            status_code=500,
            detail="Stripe secret key is not configured",
        )

    try:
        intent = stripe.PaymentIntent.create(
            amount=200,
            currency="usd",
            automatic_payment_methods={"enabled": True},
        )

        return {
            "payment_intent_id": intent.id,
            "client_secret": intent.client_secret,
            "amount": intent.amount,
            "currency": intent.currency,
        }

    except stripe.StripeError:
        raise HTTPException(
            status_code=502,
            detail="Unable to create Stripe PaymentIntent",
        )
