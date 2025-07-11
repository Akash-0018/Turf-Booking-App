# backend/turfs/serializers.py
from rest_framework import serializers
from .models import Turf, TurfImage

class TurfImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TurfImage
        fields = ['id', 'image', 'is_primary']

class TurfSerializer(serializers.ModelSerializer):
    images = TurfImageSerializer(many=True, read_only=True)
    owner_phone = serializers.CharField(source='owner.phone_number', read_only=True)

    class Meta:
        model = Turf
        fields = [
            'id', 'name', 'description', 'location', 'map_coordinates',
            'weekday_price', 'weekend_price', 'owner_phone',
            'created_at', 'updated_at', 'images'
        ]
        read_only_fields = ['owner']

class TurfCreateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    primary_image = serializers.ImageField(write_only=True)

    class Meta:
        model = Turf
        fields = [
            'name', 'description', 'location', 'map_coordinates',
            'weekday_price', 'weekend_price', 'primary_image', 'images'
        ]

    def create(self, validated_data):
        primary_image = validated_data.pop('primary_image', None)
        additional_images = validated_data.pop('images', [])

        turf = Turf.objects.create(owner=self.context['request'].user, **validated_data)

        if primary_image:
            TurfImage.objects.create(turf=turf, image=primary_image, is_primary=True)

        for image in additional_images:
            TurfImage.objects.create(turf=turf, image=image, is_primary=False)

        return turf