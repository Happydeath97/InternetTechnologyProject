from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission

# permission group assignment usage example:
# from django.contrib.auth.models import Group
#
# group = Group.objects.get(name='Editor')
# user.groups.add(group)

# how to check permission usage example:
# request.user.has_perm('movies.add_movie')
# request.user.has_perm('movies.change_movie')
# request.user.has_perm('users.change_ban')


class Command(BaseCommand):
    help = 'Create default groups and assign permissions for MoviePulse.'

    def handle(self, *args, **options):
        # Group definitions with permission codenames
        group_permissions = {
            'User': [
                'view_genre', 'view_author', 'view_movie', 'add_rating',
                'change_rating', 'delete_rating', 'view_rating',
                'add_comment', 'change_comment', 'delete_comment',
                'view_comment', 'add_report', 'view_report',
            ],
            'Editor': [
                'view_genre', 'add_genre', 'change_genre', 'delete_genre',
                'view_author', 'add_author', 'change_author', 'delete_author',
                'view_movie', 'add_movie', 'change_movie', 'delete_movie',
                'view_rating', 'view_comment', 'view_report',
            ],
            'Admin': [
                'view_genre', 'add_genre', 'change_genre', 'delete_genre',
                'view_author', 'add_author', 'change_author', 'delete_author',
                'view_movie', 'add_movie', 'change_movie', 'delete_movie',
                'view_rating', 'change_rating', 'delete_rating',
                'view_comment', 'change_comment', 'delete_comment',
                'view_report', 'change_report', 'delete_report',
                'view_ban', 'add_ban', 'change_ban', 'delete_ban',
            ],
        }

        for group_name, permission_codenames in group_permissions.items():
            group, created = Group.objects.get_or_create(name=group_name)

            permissions = Permission.objects.filter(
                codename__in=permission_codenames
            )

            group.permissions.set(permissions)

            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created group: {group_name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Updated group: {group_name}')
                )

            self.stdout.write(
                self.style.NOTICE(
                    f'Assigned {permissions.count()} permissions to {group_name}'
                )
            )

        self.stdout.write(self.style.SUCCESS('Group setup completed.'))
