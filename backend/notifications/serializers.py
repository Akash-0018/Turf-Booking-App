# backend/notifications/serializers.py
from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'notification_type', 'title', 'message', 'status', 'created_at', 'sent_at']
        read_only_fields = ['user', 'status', 'created_at', 'sent_at']