from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task, Category
from .serializers import TaskSerializer, CategorySerializer
from django.utils import timezone

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Task.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        tasks = self.get_queryset()
        total = tasks.count()
        completed = tasks.filter(status='completed').count()
        in_progress = tasks.filter(status='in-progress').count()
        pending = tasks.filter(status='pending').count()
        high_priority = tasks.filter(priority='high').count()

        return Response({
            'total': total,
            'completed': completed,
            'in_progress': in_progress,
            'pending': pending,
            'high_priority': high_priority
        })

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)