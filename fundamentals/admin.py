from django.contrib import admin
from .models import Filing, MetricSnapshot, ValuationJob

admin.site.register(Filing)
admin.site.register(MetricSnapshot)
admin.site.register(ValuationJob)
