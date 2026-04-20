import django_filters
from .models import Task

class TaskFilter(django_filters.FilterSet):
    
    due_from = django_filters.DateFilter(field_name='due_date', lookup_expr='gte')
    due_to = django_filters.DateFilter(field_name='due_date', lookup_expr='lte')

    class Meta:
        model = Task
        fields = ["created_by", "priority", "is_done", "status"] 