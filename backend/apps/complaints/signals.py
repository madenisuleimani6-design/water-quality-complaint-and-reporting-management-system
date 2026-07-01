from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .context import get_performed_by
from .models import Complaint, ComplaintLog


def broadcast_status(complaint_id, status):
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    async_to_sync(channel_layer.group_send)(
        f"complaint_{complaint_id}",
        {"type": "status_update", "status": status},
    )


@receiver(pre_save, sender=Complaint)
def log_complaint_changes(sender, instance: Complaint, **kwargs):
    if not instance.pk:
        return

    previous = Complaint.objects.filter(pk=instance.pk).first()
    if not previous:
        return

    performer = get_performed_by()
    logs_to_create = []

    if previous.status != instance.status:
        logs_to_create.append(
            ComplaintLog(
                complaint=instance,
                action=(
                    f"Status changed from {previous.get_status_display()} "
                    f"to {instance.get_status_display()}"
                ),
                performed_by=performer,
            )
        )

    if previous.assigned_to_id != instance.assigned_to_id:
        prev_name = previous.assigned_to.username if previous.assigned_to else "Unassigned"
        new_name = instance.assigned_to.username if instance.assigned_to else "Unassigned"
        logs_to_create.append(
            ComplaintLog(
                complaint=instance,
                action=f"Assignment changed from {prev_name} to {new_name}",
                performed_by=performer,
            )
        )

    for log in logs_to_create:
        log.save()


@receiver(post_save, sender=Complaint)
def broadcast_complaint_status(sender, instance: Complaint, created, **kwargs):
    if created:
        return
    broadcast_status(str(instance.id), instance.status)
