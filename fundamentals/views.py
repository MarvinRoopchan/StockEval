from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Company, ValuationJob
from .serializers import ValuationJobSerializer
from django.shortcuts import get_object_or_404

# Create your views here.

class ValuationRequestView(APIView):
    def post(self, request):
        ticker = request.data.get('ticker')
        if not ticker:
            return Response({'error': 'Ticker is required.'}, status=status.HTTP_400_BAD_REQUEST)
        company, _ = Company.objects.get_or_create(ticker=ticker.upper(), defaults={'name': ticker.upper(), 'exchange': ''})
        job = ValuationJob.objects.create(company=company, status='queued')
        return Response({'job_id': str(job.id), 'status': job.status}, status=status.HTTP_201_CREATED)

class ValuationJobStatusView(APIView):
    def get(self, request, job_id):
        job = get_object_or_404(ValuationJob, id=job_id)
        if job.status == 'ready':
            # Placeholder for actual data
            data = {'status': job.status, 'data': {}}
        else:
            data = {'status': job.status}
        return Response(data)
