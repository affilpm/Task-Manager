from rest_framework import serializers
from django.utils import timezone
from .models import Task, Category
from users.models import CustomUser

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class TaskSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False,
        allow_null=True
    )
    owner_email = serializers.EmailField(source='owner.email', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'priority',
            'due_date', 'category', 'category_id', 'owner_email',
            'created_at', 'updated_at', 'is_overdue'
        ]
        read_only_fields = ['owner', 'created_at', 'updated_at', 'is_overdue']

    def validate_due_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Due date cannot be in the past.")
        return value