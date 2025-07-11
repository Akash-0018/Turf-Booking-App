# backend/turfs/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TurfViewSet

router = DefaultRouter()
router.register(r'', TurfViewSet)

urlpatterns = [
    path('', include(router.urls)),
]