from rest_framework import serializers
from .models import Contact, Task, Team, TaskStatus, TaskStatusChoices
from django.utils import timezone
from django.contrib.auth.models import Group


class TeamSerializer(serializers.ModelSerializer):
    manager_username = serializers.SerializerMethodField()
    supervisor_username = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = ["id", "name", "department", "manager", "manager_username", "supervisor", "supervisor_username", "created_at"]

    def validate(self, attrs):
        instance = self.instance
        manager = attrs.get('manager', getattr(instance, 'manager', None))
        supervisor = attrs.get('supervisor', getattr(instance, 'supervisor', None))

        if manager == supervisor:
            raise serializers.ValidationError("Manager and supervisor cannot be the same.")
        
        # Check if manager has Manager group
        if manager and not manager.groups.filter(name="Manager").exists():
            raise serializers.ValidationError({"manager": f"User {manager.username} does not have the Manager group."})

        # Check if supervisor has Supervisor group
        if supervisor and not supervisor.groups.filter(name="Supervisor").exists():
            raise serializers.ValidationError({"supervisor": f"User {supervisor.username} does not have the Supervisor group."})

        # Check if manager is already a supervisor elsewhere
        if manager:
            qs = Team.objects.filter(supervisor=manager)
            if instance:
                qs = qs.exclude(pk=instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"manager": f"{manager.username} is already a supervisor of another team."})

        # Check if supervisor is already a manager elsewhere
        if supervisor:
            qs = Team.objects.filter(manager=supervisor)
            if instance:
                qs = qs.exclude(pk=instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"supervisor": f"{supervisor.username} is already a manager of another team."})

        return attrs

    def get_manager_username(self, obj):
        return obj.manager.username if obj.manager else None

    def get_supervisor_username(self, obj):
        return obj.supervisor.username if obj.supervisor else None


class ContactSerializer(serializers.ModelSerializer):
    total_tasks = serializers.IntegerField(read_only=True)
    open_tasks = serializers.IntegerField(read_only=True)
    done_tasks = serializers.IntegerField(read_only=True)
    role = serializers.CharField(required=False)

    class Meta:
        model = Contact
        fields = [
            "id",
            "username",
            "phone",
            "email",
            "is_active",
            "is_superuser",
            "notes",
            "profile_image_url",
            "cover_image_url",
            "address",
            "team",
            "role",
            "groups",
            "created_at",
            "total_tasks",
            "open_tasks",
            "done_tasks",
        ]
        read_only_fields = ["id", "created_at", "total_tasks", "open_tasks", "done_tasks"]
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        first = instance.groups.first()
        data["role"] = first.name if first else "Not Defined"
        if instance.team:
            data["team"] = TeamSerializer(instance.team).data
        return data

    def create(self, validated_data):
        role_name = validated_data.pop("role", "Employee")
        contact = super().create(validated_data)
        if role_name:
            from django.contrib.auth.models import Group
            group, _ = Group.objects.get_or_create(name=role_name.capitalize())
            contact.groups.add(group)
        return contact

    def update(self, instance, validated_data):
        role_name = validated_data.pop("role", None)
        contact = super().update(instance, validated_data)
        if role_name:
            from django.contrib.auth.models import Group
            group, _ = Group.objects.get_or_create(name=role_name.capitalize())
            contact.groups.clear()
            contact.groups.add(group)
        return contact


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ["id", "created_at"]

    def validate_due_date(self, value):
        if value and value < timezone.localdate():
            raise serializers.ValidationError("Due date cannot be in the past")
        return value      

    def validate(self, attrs):
        # DRF check: Combine existing instance data with incoming attributes
        instance = self.instance
        title = attrs.get('title', getattr(instance, 'title', None))
        assigned_to_user = attrs.get('assigned_to_user', getattr(instance, 'assigned_to_user', None))
        assigned_to_team = attrs.get('assigned_to_team', getattr(instance, 'assigned_to_team', None))
        is_done = attrs.get('is_done', getattr(instance, 'is_done', False))

        # 1. Assignment Validation (Must be one or the other)
        if assigned_to_user and assigned_to_team:
            raise serializers.ValidationError("Task can be assigned to either a user or a team, not both.")
        
        if not assigned_to_user and not assigned_to_team:
            # We check if it is being set to null explicitly or is missing
            raise serializers.ValidationError("Task must be assigned to a user or a team.")

        if not title:
            return attrs

        # 2. Title Uniqueness per User
        if assigned_to_user and not is_done:
            duplicate_tasks = Task.objects.filter(
                assigned_to_user=assigned_to_user,
                title__iexact=title,
                is_done=False
            )
            if instance:
                duplicate_tasks = duplicate_tasks.exclude(pk=instance.pk)
            
            if duplicate_tasks.exists():
                raise serializers.ValidationError({
                    "title": f"The user '{assigned_to_user.username}' already has an active task titled '{title}'."
                })

        # Validation for team assignment
        if assigned_to_team and not is_done:
            duplicate_tasks = Task.objects.filter(
                assigned_to_team=assigned_to_team,
                title__iexact=title,
                is_done=False
            )
            if instance:
                duplicate_tasks = duplicate_tasks.exclude(pk=instance.pk)

            if duplicate_tasks.exists():
                raise serializers.ValidationError({
                    "title": f"The team '{assigned_to_team.name}' already has an active task titled '{title}'."
                })

        return attrs


class TaskStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskStatus
        fields = "__all__"
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        name = attrs.get('name')
        rejection_reason = attrs.get('rejection_reason')

        if name == TaskStatusChoices.REJECTED and not rejection_reason:
            raise serializers.ValidationError({
                "rejection_reason": "Rejected status must include a rejection reason."
            })

        if name != TaskStatusChoices.REJECTED and rejection_reason:
            raise serializers.ValidationError({
                "rejection_reason": "Rejection reason is only allowed when status is REJECTED."
            })

        return attrs



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Contact
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        user = Contact.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            is_active=False,
            password=validated_data["password"],
        )
        return user


