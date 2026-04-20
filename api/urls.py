from rest_framework.routers import DefaultRouter
from .views import (
    ContactViewSet,
    TaskViewSet,
    RegisterView,
    UserAssignedTasksAPIView,
    RetriveUserTaskAPIView,
    TeamViewSet,
    UpdateUserTaskAPIView,
    ListTaskStatusHistoryView,
    CreateTaskStatusHistoryView,
    ListAllContactsAPIView)
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

router = DefaultRouter()
router.register("contacts", ContactViewSet, basename="contact")
router.register("tasks", TaskViewSet, basename="task")
router.register("teams", TeamViewSet, basename="team")


urlpatterns = [
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/signup/", RegisterView.as_view(), name="signup"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/logout/", TokenBlacklistView.as_view(), name="token_blacklist"),
    path("tasks/my-tasks/", UserAssignedTasksAPIView.as_view(), name="user_assigned_tasks"),
    path("tasks/<int:pk>/details/", RetriveUserTaskAPIView.as_view(), name="task_details"),
    path("tasks/<int:pk>/update/", UpdateUserTaskAPIView.as_view(), name="task_update"),
    path("task-statuses/<int:pk>/history/", ListTaskStatusHistoryView.as_view(), name="task_status_history"),
    path("task-statuses/create/", CreateTaskStatusHistoryView.as_view(), name="task_status_create"),
    path("contacts/all/", ListAllContactsAPIView.as_view(), name="all_contacts"),
]

urlpatterns += router.urls