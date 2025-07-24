from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ValuationJob
from .serializers import ValuationJobSerializer
from django.shortcuts import get_object_or_404
import yfinance as yf
from rest_framework import generics

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
        import yfinance as yf

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
