# StockEval

StockEval is a Django-based REST API for requesting and tracking company valuation jobs. It allows users to submit a company ticker for valuation and check the status of the valuation job.

## Features
- Submit a company ticker to request a valuation job
- Check the status of a valuation job
- Models for companies, filings, financial metrics, and valuation jobs

## Tech Stack
- Python 3.12+
- Django 5.2.3
- Django REST Framework 3.15.1
- SQLite (default, can be swapped for another DB)

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd stockeval
   ```
2. **Create and activate a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Apply migrations:**
   ```bash
   python manage.py migrate
   ```
5. **Run the development server:**
   ```bash
   python manage.py runserver
   ```

## API Endpoints

### Request a Valuation Job
- **POST** `/fundamentals/valuations/request/`
- **Body:** `{ "ticker": "AAPL" }`
- **Response:** `{ "job_id": 1, "status": "queued" }`

### Check Valuation Job Status
- **GET** `/fundamentals/valuations/<job_id>/`
- **Response:**
  - If ready: `{ "status": "ready", "data": { ... } }`
  - Otherwise: `{ "status": "queued" }`

## Models
- **Company:** Ticker, name, exchange
- **Filing:** Company, type (10-K, 10-Q, etc.), period end, source URL, raw JSON
- **MetricSnapshot:** Filing, ROIC, shareholder equity, long-term debt, operating income, taxes payable
- **ValuationJob:** Company, requested/finished timestamps, status (queued, in_progress, ready, failed)

## Notes
- This project is for demonstration and does not perform real valuations yet.
- Extend the logic in `fundamentals/views.py` to implement actual valuation processing.

## License
MIT (or specify your license) 