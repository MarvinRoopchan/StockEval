from django.urls import path
from .views import ValuationRequestView, ValuationJobStatusView

urlpatterns = [
    path('valuations/request/', ValuationRequestView.as_view(), name='valuation-request'),
    path('valuations/<int:job_id>/', ValuationJobStatusView.as_view(), name='valuation-job-status'),
] 