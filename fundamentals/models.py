from django.db import models

# Create your models here.


class Filing(models.Model):
    ticker = models.CharField(max_length=10, null=True, blank=True)
    type = models.CharField(max_length=10)  # 10-K, 10-Q, etc.
    period_end = models.DateField()
    source_url = models.URLField()
    raw_json = models.TextField()

    def __str__(self):
        return f"{self.ticker} {self.type} {self.period_end}"


class MetricSnapshot(models.Model):
    filing = models.ForeignKey(Filing, on_delete=models.CASCADE)
    roic = models.FloatField(null=True, blank=True)
    shareholder_equity = models.FloatField(null=True, blank=True)
    long_term_debt = models.FloatField(null=True, blank=True)
    operating_income = models.FloatField(null=True, blank=True)
    taxes_payable = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Metrics for {self.filing}"


class ValuationJob(models.Model):
    STATUS_CHOICES = [
        ("queued", "Queued"),
        ("in_progress", "In Progress"),
        ("ready", "Ready"),
        ("failed", "Failed"),
    ]
    ticker = models.CharField(max_length=10, null=True, blank=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="queued")

    def __str__(self):
        return f"Job {self.id} for {self.ticker} - {self.status}"
