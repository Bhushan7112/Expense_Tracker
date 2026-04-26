from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from decimal import Decimal
from typing import Optional
import json
import os
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FILE = "expenses.json"

if not os.path.exists(FILE):
    with open(FILE, "w") as f:
        json.dump({"expenses": [], "keys": {}}, f)


class ExpenseCreate(BaseModel):
    amount: str
    category: str
    description: str
    date: str


def load_data():
    with open(FILE, "r") as f:
        return json.load(f)


def save_data(data):
    with open(FILE, "w") as f:
        json.dump(data, f, indent=2)


@app.get("/")
def home():
    return {"status": "running"}


@app.post("/expenses")
def create_expense(
    expense: ExpenseCreate,
    idempotency_key: Optional[str] = Header(None)
):
    data = load_data()

    if idempotency_key and idempotency_key in data["keys"]:
        old_id = data["keys"][idempotency_key]

        for item in data["expenses"]:
            if item["id"] == old_id:
                return item

    if Decimal(expense.amount) < 0:
        raise HTTPException(status_code=400, detail="Amount cannot be negative")

    new_id = len(data["expenses"]) + 1

    new_expense = {
        "id": new_id,
        "amount": expense.amount,
        "category": expense.category,
        "description": expense.description,
        "date": expense.date,
        "created_at": datetime.now().isoformat()
    }

    data["expenses"].append(new_expense)

    if idempotency_key:
        data["keys"][idempotency_key] = new_id

    save_data(data)

    return new_expense


@app.get("/expenses")
def get_expenses(category: Optional[str] = None, sort: Optional[str] = None):
    data = load_data()
    expenses = data["expenses"]

    # Case-insensitive filter
    if category:
        expenses = [
            x for x in expenses
            if x["category"].lower() == category.lower()
        ]

    # Sorting
    if sort == "date_desc":
        expenses.sort(
            key=lambda x: x["date"],
            reverse=True
        )

    elif sort == "date_asc":
        expenses.sort(
            key=lambda x: x["date"]
        )

    return expenses
    return expenses

@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int):
    data = load_data()

    original_length = len(data["expenses"])

    data["expenses"] = [
        item for item in data["expenses"]
        if item["id"] != expense_id
    ]

    if len(data["expenses"]) == original_length:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    save_data(data)

    return {"message": "Expense deleted successfully"}