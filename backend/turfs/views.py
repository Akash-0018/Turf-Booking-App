# backend/turfs/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Turf, TurfImage
from .serializers import TurfSerializer, TurfCreateSerializer, TurfImageSerializer
from accounts.models import User

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user

class TurfViewSet(viewsets.ModelViewSet):
    queryset = Turf.objects.all()
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update':
            return TurfCreateSerializer
        return TurfSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        return [permissions.AllowAny()]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = TurfSerializer(queryset, many=True)

        # Add primary image URL to each turf
        for turf_data in serializer.data:
            turf = Turf.objects.get(id=turf_data['id'])
            primary_image = turf.images.filter(is_primary=True).first()
            if primary_image:
                turf_data['primary_image'] = request.build_absolute_uri(primary_image.image.url)
            else:
                turf_data['primary_image'] = None

        return Response(serializer.data)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser])
    def upload_images(self, request, pk=None):
        turf = self.get_object()

        if turf.owner != request.user:
            return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        images = request.FILES.getlist('images')
        is_primary = request.data.get('is_primary', 'false').lower() == 'true'

        if is_primary:
            # Set all existing images as non-primary
            TurfImage.objects.filter(turf=turf, is_primary=True).update(is_primary=False)

        image_objects = []
        for image in images:
            turf_image = TurfImage.objects.create(
                turf=turf,
                image=image,
                is_primary=is_primary if len(images) == 1 else False
            )
            image_objects.append(turf_image)

        serializer = TurfImageSerializer(image_objects, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)