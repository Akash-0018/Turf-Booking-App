# backend/notifications/admin.py
from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'title', 'status', 'created_at', 'sent_at')
    list_filter = ('notification_type', 'status')
    search_fields = ('user__phone_number', 'title', 'message')
    date_hierarchy = 'created_at'