from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from users.models import CustomUser


# Get the custom user model
User = CustomUser

class Category(models.Model):
    """
    Model to represent task categories for organizing tasks.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='categories',
        help_text="User who created this category."
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        return self.name

class Task(models.Model):
    """
    Model to represent a task in the task manager.
    """
    # Status choices
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    # Priority choices
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    title = models.CharField(
        max_length=255,
        help_text="Title of the task."
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Detailed description of the task (optional)."
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Current status of the task."
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='medium',
        help_text="Priority level of the task."
    )
    due_date = models.DateField(
        help_text="Due date for the task."
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tasks',
        help_text="User who owns this task."
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='tasks',
        help_text="Category this task belongs to (optional)."
    )
    created_at = models.DateTimeField(
        default=timezone.now,
        help_text="When the task was created."
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="When the task was last updated."
    )

    class Meta:
        verbose_name = "Task"
        verbose_name_plural = "Tasks"
        ordering = ['due_date', 'priority']
        indexes = [
            models.Index(fields=['owner', 'status']),
            models.Index(fields=['due_date']),
        ]

    def __str__(self):
        return f"{self.title} ({self.owner.email})"

    @property
    def is_overdue(self):
        """
        Check if the task is overdue based on the due date.
        """
        return self.due_date < timezone.now().date() and self.status != 'completed'