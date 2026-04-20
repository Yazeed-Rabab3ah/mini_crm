from django.contrib import admin
from .models import Contact, Task, Team, TaskStatus

admin.site.register(Contact)
admin.site.register(Task)
admin.site.register(Team)
admin.site.register(TaskStatus)


