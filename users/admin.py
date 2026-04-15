from django.contrib import admin
from .models import Ban
# Register your models here.


@admin.register(Ban)
class BanAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'admin',
        'status',
        'is_permanent',
        'start_date',
        'end_date',
        'created_at',
    )
    list_filter = (
        'status',
        'is_permanent',
        'start_date',
        'created_at',
    )
    search_fields = (
        'user__username',
        'user__email',
        'admin__username',
        'admin__email',
        'reason',
    )
    ordering = ('-created_at',)
