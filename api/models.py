from django.db import models
from django.core.validators import MinLengthValidator, RegexValidator, URLValidator
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.core.exceptions import ValidationError

class Priority(models.TextChoices):
    LOW = "low", "Low"
    MEDIUM = "medium", "Medium"
    HIGH = "high", "High"

class Department(models.TextChoices):
    IT = "it", "IT"
    MARKETING = "marketing", "Marketing"
    FINANCE = "finance", "Finance"

class TaskStatusChoices(models.TextChoices):
    ASSIGNED = "assigned", "Assigned"
    SUBMITTED = "submitted", "Submitted"
    REVIEWED = "reviewed", "Reviewed"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"

class Contact(AbstractUser):
    phone_validator = RegexValidator(
        regex=r'^\+?[0-9]{7,15}$',
        message='Phone number is not valid'
    )

    username = models.CharField(unique=True, max_length=50, validators=[MinLengthValidator(3)])
    phone = models.CharField(max_length=50, blank=True, null=True, validators=[phone_validator])
    notes = models.TextField(blank=True, null=True)
    profile_image_url = models.URLField(max_length=500, blank=True, null=True)
    cover_image_url = models.URLField(max_length=500, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    team = models.ForeignKey(
        "Team",
        on_delete=models.SET_NULL, 
        null=True,
        blank=True,
        related_name="employees"
    )

    def __str__(self):
        return self.username

class Task(models.Model):
    created_by = models.ForeignKey(
        Contact,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_tasks"
    )

    assigned_to_user = models.ForeignKey(
        Contact,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tasks"
    )

    assigned_to_team = models.ForeignKey(
        "Team",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks"
    ) 
   
    title = models.CharField(max_length=50, validators=[MinLengthValidator(3)])
    due_date = models.DateField(blank=True, null=True)
    priority = models.CharField(choices=Priority.choices, max_length=50, default=Priority.MEDIUM)
    is_done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(choices=TaskStatusChoices.choices, default=TaskStatusChoices.ASSIGNED)
    content = models.TextField(blank=True, null=True)
    
    class Meta:
        permissions = [
            ("can_assign_task", "Can assign task"),
            ("can_review_task", "Can review task"),
            ("can_approve_task", "Can approve task"),
            ("can_reject_task", "Can reject task"),
        ]
    def clean(self):
        if self.due_date and self.due_date < timezone.localdate():
            raise ValidationError("Due date cannot be in the past")
            
        if self.assigned_to_user and self.assigned_to_team:
            raise ValidationError("Task can be assigned to either a user or a team, not both.")

        if not self.assigned_to_user and not self.assigned_to_team:
            raise ValidationError("Task must be assigned to a user or a team.")

        # Title uniqueness check for assigned user
        if self.assigned_to_user and not self.is_done:
            duplicate_tasks = Task.objects.filter(
                assigned_to_user=self.assigned_to_user,
                title__iexact=self.title,
                is_done=False
            )
            if self.pk:
                duplicate_tasks = duplicate_tasks.exclude(pk=self.pk)
            
            if duplicate_tasks.exists():
                raise ValidationError(f"The user '{self.assigned_to_user.username}' already has an active task titled '{self.title}'.")

        # Title uniqueness check for assigned team
        if self.assigned_to_team and not self.is_done:
            duplicate_tasks = Task.objects.filter(
                assigned_to_team=self.assigned_to_team,
                title__iexact=self.title,
                is_done=False
            )
            if self.pk:
                duplicate_tasks = duplicate_tasks.exclude(pk=self.pk)

            if duplicate_tasks.exists():
                raise ValidationError(f"The team '{self.assigned_to_team.name}' already has an active task titled '{self.title}'.")

    def __str__(self):
        return self.title

class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)
    department = models.CharField(
        choices=Department.choices,
        max_length=50,
        default=Department.IT
    )

    manager = models.OneToOneField(
        Contact,
        on_delete=models.CASCADE,
        related_name="managed_teams"
    )

    supervisor = models.OneToOneField(
        Contact,
        on_delete=models.CASCADE,
        related_name="supervised_teams"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        super().clean()
        if self.manager == self.supervisor:
            raise ValidationError("Manager and supervisor cannot be the same.")
        
        # Check if manager has Manager group
        if self.manager and not self.manager.groups.filter(name="Manager").exists():
            raise ValidationError(f"User {self.manager.username} does not have the Manager group.")

        # Check if supervisor has Supervisor group
        if self.supervisor and not self.supervisor.groups.filter(name="Supervisor").exists():
            raise ValidationError(f"User {self.supervisor.username} does not have the Supervisor group.")

        if Team.objects.filter(supervisor=self.manager).exclude(pk=self.pk).exists():
            raise ValidationError(f"{self.manager.username} is already a supervisor of another team.")

        if Team.objects.filter(manager=self.supervisor).exclude(pk=self.pk).exists():
            raise ValidationError(f"{self.supervisor.username} is already a manager of another team.")

    def __str__(self):
        return self.name

class TaskStatus(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='status_history')
    name = models.CharField(choices=TaskStatusChoices.choices, default=TaskStatusChoices.ASSIGNED)
    note = models.TextField(blank=True, null=True)  
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    changed_by = models.ForeignKey(
        Contact,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="task_status_changes"
    )
    def clean(self):
        if self.name == TaskStatusChoices.REJECTED and not self.rejection_reason:
            raise ValidationError("Rejected status must include a rejection reason.")

        if self.name != TaskStatusChoices.REJECTED and self.rejection_reason:
            raise ValidationError("Rejection reason is only allowed when status is REJECTED.")

    def __str__(self):
        return f"{self.task.title} - {self.name}"