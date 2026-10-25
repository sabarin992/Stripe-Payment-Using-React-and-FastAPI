
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from uuid import uuid4

app = FastAPI()

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
