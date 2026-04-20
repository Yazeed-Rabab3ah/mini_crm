from django.db.models import Q, Count
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Contact, Task, Team, TaskStatus, TaskStatusChoices
from .serializers import ContactSerializer, TaskSerializer, RegisterSerializer, TeamSerializer, TaskStatusSerializer
from rest_framework.pagination import PageNumberPagination
from .filters import TaskFilter
from rest_framework.filters import SearchFilter
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .permissions import CanAssignTask, CanCreateTask
from .serializers import (ContactSerializer, TaskSerializer, RegisterSerializer, 
                        TeamSerializer, TaskStatusSerializer)
from rest_framework.generics import ListAPIView, RetrieveAPIView, UpdateAPIView, CreateAPIView
from rest_framework.exceptions import PermissionDenied
from .permissions import CanCreateTask, CanCRUDonContact, CanCreateTeam, CanEditTask

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all().order_by("-created_at")
    serializer_class = ContactSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, SearchFilter]
    search_fields = ["username", "phone", "email"]
    filterset_fields = ["is_active", "team"]
    ordering_fields = ["username", "created_at"]
    ordering = ["-created_at"]

   
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        else:
            return [IsAuthenticated(), CanCRUDonContact()]


class ListAllContactsAPIView(ListAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = TaskFilter
    ordering_fields = ["due_date", "created_at", "priority"]
    ordering = ["-created_at"]
    pagination_class = PageNumberPagination
    

    def get_permissions(self):
        if self.action in ["update", "partial_update"]:
            return [IsAuthenticated(), CanEditTask()]
        if self.action == "destroy":
            return [IsAuthenticated(), CanEditTask()]
            
        if self.action == "create":
            return [IsAuthenticated(), CanCreateTask()]

        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = Task.objects.select_related(
            "created_by",
            "assigned_to_user",
            "assigned_to_team",
        )

        return qs.filter(Q(created_by=user))

    def perform_create(self, serializer):
        user = self.request.user

        assigned_user = serializer.validated_data.get("assigned_to_user")
        assigned_team = serializer.validated_data.get("assigned_to_team")

        if not user.is_superuser:
            if assigned_user and assigned_user != user:
                raise PermissionDenied("You can only assign tasks to yourself.")

            if assigned_team and assigned_team != user.team:
                raise PermissionDenied("You can only assign tasks to your own team.")

        task = serializer.save(created_by=user)
        TaskStatus.objects.create(
            task=task,
            name=task.status,
            changed_by=user
        )


class UserAssignedTasksAPIView(ListAPIView):
    serializer_class = TaskSerializer
    filterset_class = TaskFilter
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        qs = Task.objects.select_related(
            "assigned_to_user",
            "assigned_to_team"
        ).filter(
            Q(assigned_to_user=user) |
            Q(assigned_to_team=user.team)
        ).order_by("-created_at").distinct()

        if user.groups.filter(name="Employee").exists():
            return qs.filter(status__in=["assigned", "submitted", "rejected"])
       
        return qs


class RetriveUserTaskAPIView(RetrieveAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Task.objects.select_related(
            "assigned_to_user",
            "assigned_to_team"
        ).filter(
            Q(assigned_to_user=user) |
            Q(assigned_to_team=user.team)
            ).order_by("-created_at").distinct()
        
        if user.groups.filter(name="Employee").exists():
            return qs.filter(status__in=["assigned", "submitted", "rejected"])

        return qs


class UpdateUserTaskAPIView(UpdateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return Task.objects.select_related(
            "assigned_to_user",
            "assigned_to_team"
        ).filter(
            Q(assigned_to_user=user) |
            Q(assigned_to_team=user.team)
        ).order_by("-created_at").distinct()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all().order_by("-created_at")
    serializer_class = TeamSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["department"]

    def get_permissons(self):
        if self.action == 'create':
            return [IsAuthenticated(), CanCreateTeam()]
        else:
            return [IsAuthenticated()]


class ListTaskStatusHistoryView(ListAPIView):
    serializer_class = TaskStatusSerializer

    def get_queryset(self):
        task_id = self.kwargs.get("pk")
        return TaskStatus.objects.filter(task=task_id).order_by("created_at")
    

class CreateTaskStatusHistoryView(CreateAPIView):
    queryset = TaskStatus.objects.all()
    serializer_class = TaskStatusSerializer

    def perform_create(self, serializer):
        status_entry = serializer.save()
        task = status_entry.task
        task.status = status_entry.name
        if status_entry.name == TaskStatusChoices.APPROVED:
            task.is_done = True
        else:
            task.is_done = False
        task.save(update_fields=["status", "is_done"])
    