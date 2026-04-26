import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

function App() {
  const API = "http://127.0.0.1:8000";

  const [form, setForm] = useState({
    amount: "",
    category: "",
    description: "",
    date: ""
  });

  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("date_desc");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let url = `${API}/expenses?sort=${sort}`;

      if (filter.trim()) {
        url += `&category=${encodeURIComponent(filter.trim())}`;
      }

      const res = await axios.get(url);
      setExpenses(res.data);
    } catch (err) {
      setError("Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  }, [filter, sort]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const submit = async () => {
    setError("");
    setSuccess("");

    if (!form.amount.trim()) {
      setError("Amount is required.");
      return;
    }

    if (!form.category) {
      setError("Category is required.");
      return;
    }

    if (!form.date) {
      setError("Date is required.");
      return;
    }

if (form.amount === "") {
  setError("Amount is required.");
  return;
}

if (!/^-?\d+(\.\d{1,2})?$/.test(form.amount)) {
  setError("Invalid amount entered.");
  return;
}

if (parseFloat(form.amount) <= 0) {
  setError("Amount must be > 0.");
  return;
}
    const selectedDate = new Date(form.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      setError("Future dates are not allowed.");
      return;
    }

    const descriptionRegex = /^[A-Za-z0-9 ,. -]*$/;

    if (
      form.description.trim() &&
      !descriptionRegex.test(form.description.trim())
    ) {
      setError("Description contains invalid characters.");
      return;
    }

    if (form.description.length > 100) {
      setError("Description must be under 100 characters.");
      return;
    }

    try {
      setLoading(true);

      const key = uuidv4();

      await axios.post(`${API}/expenses`, form, {
        headers: {
          "Idempotency-Key": key
        }
      });

      setForm({
        amount: "",
        category: "",
        description: "",
        date: ""
      });

      setSuccess("Expense added successfully.");
      loadExpenses();

    } catch (err) {
      setError("Failed to add expense.");
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id) => {
    try {
      setLoading(true);
      setError("");

      await axios.delete(`${API}/expenses/${id}`);

      setSuccess("Expense deleted successfully.");
      loadExpenses();

    } catch (err) {
      setError("Failed to delete expense.");
    } finally {
      setLoading(false);
    }
  };

  const total = expenses.reduce(
    (sum, item) => sum + parseFloat(item.amount || 0),
    0
  );

  const summary = {};

  expenses.forEach((item) => {
    const category = item.category || "Others";

    summary[category] =
      (summary[category] || 0) + parseFloat(item.amount || 0);
  });

  return (
    <div className="container">
      <div className="card">

        <h1>Expense Tracker Dashboard</h1>

        <div className="form-section">
          <div className="form-grid">

   <input
  type="text"
  inputMode="decimal"
  placeholder="Amount"
  value={form.amount}
  onChange={(e) => {
    const value = e.target.value;

    // allow optional leading - while typing, digits, optional decimal
    if (/^-?\d*\.?\d{0,2}$/.test(value)) {
      setForm({ ...form, amount: value });
    }
  }}
/>

            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option value="">Select Category</option>
              <option value="Food">Food</option>
              <option value="Shopping">Shopping</option>
              <option value="Travel">Travel</option>
              <option value="Bills">Bills</option>
              <option value="Rent">Rent</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Others">Others</option>
            </select>

            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value
                })
              }
            />

            <input
              type="date"
              max={new Date().toISOString().split("T")[0]}
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
              onKeyDown={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
            />

          </div>

          <button onClick={submit} disabled={loading}>
            {loading ? "Please wait..." : "Add Expense"}
          </button>
        </div>

        <div className="filter-row">

          <input
            className="filter"
            placeholder="Filter category"
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
          />

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
            style={{ width: "180px" }}
          >
            <option value="date_desc">
              Newest First
            </option>

            <option value="date_asc">
              Oldest First
            </option>
          </select>

        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <h2>Total: ₹{total.toFixed(2)}</h2>

        <div className="summary-box">
          <h3>Category Summary</h3>

          {Object.keys(summary).length === 0 ? (
            <p>No data available.</p>
          ) : (
            <div className="summary-grid">
              {Object.entries(summary).map(
                ([cat, amt]) => (
                  <div
                    className="summary-card"
                    key={cat}
                  >
                    <h4>{cat}</h4>
                    <p>₹{amt.toFixed(2)}</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="5">
                  No expenses found.
                </td>
              </tr>
            ) : (
              expenses.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{item.category}</td>
                  <td>{item.description}</td>
                  <td>
                    ₹
                    {parseFloat(
                      item.amount
                    ).toFixed(2)}
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteExpense(item.id)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      </div>
    </div>
  );
}

export default App;