from django.test import TestCase
from django.utils import timezone
from .models import Category, Task
from django.contrib.auth import get_user_model
from datetime import timedelta

User = get_user_model()

class TaskModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            full_name='Test User',
            password='password123'
        )
        self.category = Category.objects.create(
            name='Work',
            created_by=self.user
        )


    def test_task_creation(self):
        task = Task.objects.create(
            title='Test Task',
            description='Test description',
            status='pending',
            priority='high',
            due_date=timezone.now().date() - timedelta(days=1),  # yesterday
            owner=self.user,
            category=self.category
        )
        self.assertEqual(task.title, 'Test Task')
        self.assertTrue(task.is_overdue)