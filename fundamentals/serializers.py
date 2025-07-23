from rest_framework import serializers
from .models import Company, Filing, MetricSnapshot, ValuationJob

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class FilingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filing
        fields = '__all__'

class MetricSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetricSnapshot
        fields = '__all__'

class ValuationJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValuationJob
        fields = '__all__' 