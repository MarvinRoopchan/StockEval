from django.contrib import admin
from .models import Company, Filing, MetricSnapshot, ValuationJob

admin.site.register(Company)
admin.site.register(Filing)
admin.site.register(MetricSnapshot)
admin.site.register(ValuationJob)
