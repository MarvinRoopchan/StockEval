from django.urls import path
from .views import (
    ValuationRequestView,
    ValuationJobStatusView,
    LatestPriceView,
    StockPriceView,
    StockFundamentalsView,
    StockFundamentalsHistoryView,
    StockMostRecentQuarterlyReportView,
    StockMostRecentAnnualReportView,
)

urlpatterns = [
    path(
        "valuations/request/", ValuationRequestView.as_view(), name="valuation-request"
    ),
    path(
        "valuations/<int:job_id>/",
        ValuationJobStatusView.as_view(),
        name="valuation-job-status",
    ),
    path("prices/<str:ticker>/latest/", LatestPriceView.as_view(), name="latest-price"),
    path("price/<str:ticker>/", StockPriceView.as_view(), name="stock-price"),
    path(
        "fundamentals/<str:ticker>/",
        StockFundamentalsView.as_view(),
        name="stock-fundamentals",
    ),
    path(
        "fundamentals/history/<str:ticker>/",
        StockFundamentalsHistoryView.as_view(),
        name="stock-fundamentals-history",
    ),
    path(
        "fundamentals/quarterly/<str:ticker>/",
        StockMostRecentQuarterlyReportView.as_view(),
        name="stock-most-recent-quarterly",
    ),
    path(
        "fundamentals/annual/<str:ticker>/",
        StockMostRecentAnnualReportView.as_view(),
        name="stock-most-recent-annual",
    ),
]
