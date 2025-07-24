from django.urls import path
from .views import (
    ValuationRequestView,
    ValuationJobStatusView,
    LatestPriceView,
    StockPriceView,
    StockFundamentalsView,
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
]
