from rest_framework.permissions import BasePermission

class CanAssignTask(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.has_perm("yourapp.can_assign_task")
    
class CanReviewTask(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.has_perm("yourapp.can_review_task")
    
class CanApproveTask(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.has_perm("yourapp.can_approve_task")


class CanRejectTask(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.has_perm("yourapp.can_reject_task")

class IsManagerOrSupervisor(BasePermission):
    def has_permission(self, request, view):
        user = request.user 
        if not user or  not user.is_authenticated:
            return False
        return user.groups.filter(
            name__in=["Manager", "Supervisor"]
        ).exists()





class CanEditAssignedAndRejectedTasks(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if not user.groups.filter(name__in=["Employee"]).exists():
            return False
        
        is_assigned = (
            obj.assigned_to_user == user or 
            obj.assigned_to_team == user.team
        )

        return is_assigned and obj.status in ["assigned", "rejected"]


class CanEditAssignedAndSubmittedAndRejectedTasks(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if not user.groups.filter(name__in=["Supervisor"]).exists():
            return False
        
        is_assigned = (
            obj.assigned_to_user == user or 
            obj.assigned_to_team == user.team
        )

        return is_assigned and obj.status in ["assigned", "submitted", "rejected"]


class CanEditAllTasks(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if not user.groups.filter(name__in=["Manager"]).exists():
            return False
        
        is_assigned = (
            obj.assigned_to_user == user or 
            obj.assigned_to_team == user.team
        )
        if view.action == "destroy":
            return is_assigned

        return is_assigned and obj.status != "approved"



class CanEditTask(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            CanEditAssignedAndRejectedTasks().has_object_permission(request, view, obj)
            or
            CanEditAssignedAndSubmittedAndRejectedTasks().has_object_permission(request, view, obj)
            or
            CanEditAllTasks().has_object_permission(request, view, obj)
        )


class CanAssignTask(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.groups.filter(name__in=["Manager", "Supervisor"]).exists()


class CanCreateSelfTask(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if not user.groups.filter(name__in=["Employee"]).exists():
            return False
        return obj.assigned_to_user == user


class CanCreateTask(BasePermission):
    def has_permission(self, request, view):
        return (
            CanAssignTask().has_permission(request, view)
            or
            CanCreateSelfTask().has_permission(request, view)
        )



class CanCreateTeam(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False
        
        return user.groups.filter(name__in=['Manager', 'Supervisor']).exists()


class CanCRUDonContact(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        return user.groups.filter(name__in=['Manager', 'Supervisor']).exists()
        