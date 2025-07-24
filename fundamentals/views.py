from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ValuationJob
from .serializers import ValuationJobSerializer
from django.shortcuts import get_object_or_404
import yfinance as yf
from rest_framework import generics
import math
import requests
from django.conf import settings

# Create your views here.


class ValuationRequestView(APIView):
    def post(self, request):
        try:
            ticker = request.body.decode().strip()
        except Exception:
            ticker = None
        if not ticker:
            return Response(
                {"error": "Ticker is required as plain text in the body."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if ValuationJob.objects.filter(ticker=ticker.upper()).exists():
            return Response(
                {"error": f"Job for ticker {ticker.upper()} already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        job = ValuationJob.objects.create(ticker=ticker.upper(), status="queued")
        return Response(
            {"job_id": str(job.id), "status": job.status},
            status=status.HTTP_201_CREATED,
        )


class ValuationJobStatusView(APIView):
    def get(self, request, job_id):
        job = get_object_or_404(ValuationJob, id=job_id)
        if job.status == "ready":
            # Placeholder for actual data
            data = {"status": job.status, "data": {}}
        else:
            data = {"status": job.status}
        return Response(data)


class LatestPriceView(APIView):
    def get(self, request, ticker):
        ticker = ticker.upper()
        try:
            stock = yf.Ticker(ticker)
            price = stock.history(period="1d").tail(1)["Close"].iloc[0]
            return Response({"ticker": ticker, "price": float(price)})
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class StockPriceView(APIView):
    def get(self, request, ticker):
        try:
            stock = yf.Ticker(ticker)
            price = stock.history(period="1d").tail(1)["Close"].iloc[0]
            return Response({"ticker": ticker.upper(), "price": float(price)})
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class StockFundamentalsView(APIView):
    def get(self, request, ticker):
        ticker = ticker.upper()
        try:
            stock = yf.Ticker(ticker)
            # Latest price
            price = stock.history(period="1d").tail(1)["Close"].iloc[0]
            # Annual and quarterly financials
            annual_is = stock.financials
            quarterly_is = stock.quarterly_financials
            annual_bs = stock.balance_sheet
            quarterly_bs = stock.quarterly_balance_sheet

            # Extract metrics (try annual, fallback to quarterly)
            def get_metric(df, key):
                try:
                    return df.loc[key].iloc[0]
                except Exception:
                    return None

            metrics = {
                "operating_income": get_metric(annual_is, "Operating Income")
                or get_metric(quarterly_is, "Operating Income"),
                "shareholder_equity": get_metric(annual_bs, "Total Stockholder Equity")
                or get_metric(quarterly_bs, "Total Stockholder Equity"),
                "long_term_debt": get_metric(annual_bs, "Long Term Debt")
                or get_metric(quarterly_bs, "Long Term Debt"),
                "taxes_payable": get_metric(annual_bs, "Other Current Liabilities")
                or get_metric(quarterly_bs, "Other Current Liabilities"),
                # ROIC is not directly available; placeholder for now
                "roic": None,
            }
            return Response(
                {"ticker": ticker, "price": float(price), "metrics": metrics}
            )
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class StockFundamentalsHistoryView(APIView):
    def get(self, request, ticker):
        API_KEY = settings.FMP_API_KEY
        ticker = ticker.upper()
        try:
            # Fetch 5 years of income statement
            url_is = f"https://financialmodelingprep.com/api/v3/income-statement/{ticker}?limit=5&apikey={API_KEY}"
            url_bs = f"https://financialmodelingprep.com/api/v3/balance-sheet-statement/{ticker}?limit=5&apikey={API_KEY}"
            is_resp = requests.get(url_is)
            bs_resp = requests.get(url_bs)
            is_data = is_resp.json() if is_resp.status_code == 200 else []
            bs_data = bs_resp.json() if bs_resp.status_code == 200 else []

            # Helper to extract a metric for 5 years
            def get_metric_5y(data, key):
                return [year.get(key) for year in data]

            # Calculate ROIC for each year
            def get_roic_5y(is_data, bs_data):
                roic_5y = []
                for i in range(min(len(is_data), len(bs_data))):
                    try:
                        op_income = is_data[i].get("operatingIncome")
                        tax_expense = is_data[i].get("incomeTaxExpense")
                        income_before_tax = is_data[i].get("incomeBeforeTax")
                        equity = bs_data[i].get("totalStockholdersEquity")
                        long_term_debt = bs_data[i].get("longTermDebt")
                        # Calculate tax rate
                        if income_before_tax and income_before_tax != 0:
                            tax_rate = (
                                tax_expense / income_before_tax
                                if tax_expense is not None
                                else 0.21
                            )
                        else:
                            tax_rate = 0.21  # fallback to 21% if missing
                        # Calculate NOPAT
                        if op_income is not None:
                            nopat = op_income * (1 - tax_rate)
                        else:
                            nopat = None
                        # Calculate invested capital
                        if equity is not None and long_term_debt is not None:
                            invested_capital = equity + long_term_debt
                        else:
                            invested_capital = None
                        # Calculate ROIC
                        if (
                            nopat is not None
                            and invested_capital
                            and invested_capital != 0
                        ):
                            roic = nopat / invested_capital
                        else:
                            roic = None
                        roic_5y.append(roic)
                    except Exception:
                        roic_5y.append(None)
                return roic_5y

            # Calculate ROIC growth rates
            def calc_growth_rate(arr, years):
                if (
                    len(arr) > years - 1
                    and arr[0] is not None
                    and arr[years - 1] not in (None, 0)
                ):
                    return (arr[0] - arr[years - 1]) / abs(arr[years - 1])
                return None

            # Get all metrics
            op_income_5y = get_metric_5y(is_data, "operatingIncome")
            equity_5y = get_metric_5y(bs_data, "totalStockholdersEquity")
            ltd_5y = get_metric_5y(bs_data, "longTermDebt")
            taxes_5y = get_metric_5y(bs_data, "otherCurrentLiabilities")
            roic_5y = get_roic_5y(is_data, bs_data)
            metrics_history = {
                "operating_income_5y": op_income_5y,
                "shareholder_equity_5y": equity_5y,
                "long_term_debt_5y": ltd_5y,
                "taxes_payable_5y": taxes_5y,
                "roic_5y": roic_5y,
                # Explicit most recent, 1y earlier, 5y earlier
                "operating_income_most_recent": (
                    op_income_5y[0] if len(op_income_5y) > 0 else None
                ),
                "operating_income_1y_earlier": (
                    op_income_5y[1] if len(op_income_5y) > 1 else None
                ),
                "operating_income_5y_earlier": (
                    op_income_5y[4] if len(op_income_5y) > 4 else None
                ),
                "shareholder_equity_most_recent": (
                    equity_5y[0] if len(equity_5y) > 0 else None
                ),
                "shareholder_equity_1y_earlier": (
                    equity_5y[1] if len(equity_5y) > 1 else None
                ),
                "shareholder_equity_5y_earlier": (
                    equity_5y[4] if len(equity_5y) > 4 else None
                ),
                "long_term_debt_most_recent": ltd_5y[0] if len(ltd_5y) > 0 else None,
                "long_term_debt_1y_earlier": ltd_5y[1] if len(ltd_5y) > 1 else None,
                "long_term_debt_5y_earlier": ltd_5y[4] if len(ltd_5y) > 4 else None,
                "taxes_payable_most_recent": taxes_5y[0] if len(taxes_5y) > 0 else None,
                "taxes_payable_1y_earlier": taxes_5y[1] if len(taxes_5y) > 1 else None,
                "taxes_payable_5y_earlier": taxes_5y[4] if len(taxes_5y) > 4 else None,
                "roic_most_recent": roic_5y[0] if len(roic_5y) > 0 else None,
                "roic_1y_earlier": roic_5y[1] if len(roic_5y) > 1 else None,
                "roic_5y_earlier": roic_5y[4] if len(roic_5y) > 4 else None,
                # Growth rates
                "roic_1y_growth_rate": calc_growth_rate(roic_5y, 2),
                "roic_5y_growth_rate": calc_growth_rate(roic_5y, 5),
            }
            return Response({"ticker": ticker, "metrics_history": metrics_history})
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class StockMostRecentQuarterlyReportView(APIView):
    def get(self, request, ticker):
        API_KEY = settings.FMP_API_KEY
        ticker = ticker.upper()
        try:
            url_is = f"https://financialmodelingprep.com/api/v3/income-statement/{ticker}?period=quarter&limit=1&apikey={API_KEY}"
            url_bs = f"https://financialmodelingprep.com/api/v3/balance-sheet-statement/{ticker}?period=quarter&limit=1&apikey={API_KEY}"
            is_resp = requests.get(url_is)
            bs_resp = requests.get(url_bs)
            is_data = (
                is_resp.json()[0]
                if is_resp.status_code == 200 and is_resp.json()
                else {}
            )
            bs_data = (
                bs_resp.json()[0]
                if bs_resp.status_code == 200 and bs_resp.json()
                else {}
            )
            return Response(
                {
                    "ticker": ticker,
                    "quarterly_income_statement": is_data,
                    "quarterly_balance_sheet": bs_data,
                }
            )
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class StockMostRecentAnnualReportView(APIView):
    def get(self, request, ticker):
        API_KEY = settings.FMP_API_KEY
        ticker = ticker.upper()
        try:
            url_is = f"https://financialmodelingprep.com/api/v3/income-statement/{ticker}?limit=1&apikey={API_KEY}"
            url_bs = f"https://financialmodelingprep.com/api/v3/balance-sheet-statement/{ticker}?limit=1&apikey={API_KEY}"
            is_resp = requests.get(url_is)
            bs_resp = requests.get(url_bs)
            is_data = (
                is_resp.json()[0]
                if is_resp.status_code == 200 and is_resp.json()
                else {}
            )
            bs_data = (
                bs_resp.json()[0]
                if bs_resp.status_code == 200 and bs_resp.json()
                else {}
            )
            return Response(
                {
                    "ticker": ticker,
                    "annual_income_statement": is_data,
                    "annual_balance_sheet": bs_data,
                }
            )
        except Exception as e:
            return Response({"error": str(e)}, status=400)
