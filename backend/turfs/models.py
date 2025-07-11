# backend/turfs/models.py
from django.db import models
from accounts.models import User

class Turf(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='turfs')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=500)  # Google Maps link
    map_coordinates = models.CharField(max_length=100, blank=True, null=True)  # lat,lng format
    weekday_price = models.DecimalField(max_digits=10, decimal_places=2)
    weekend_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class TurfImage(models.Model):
    turf = models.ForeignKey(Turf, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='turf_images/')
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.turf.name} - {'Primary' if self.is_primary else 'Secondary'} Image"