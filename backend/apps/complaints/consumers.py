import json
import uuid

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .models import Complaint


class ComplaintStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        complaint_id = self.scope["url_route"]["kwargs"]["complaint_id"]
        try:
            uuid.UUID(str(complaint_id))
        except ValueError:
            await self.close()
            return

        self.complaint_id = str(complaint_id)
        self.group_name = f"complaint_{self.complaint_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        status = await self.get_complaint_status(self.complaint_id)
        if status is None:
            await self.close()
            return
        await self.send(text_data=json.dumps({"status": status}))

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def status_update(self, event):
        await self.send(text_data=json.dumps({"status": event["status"]}))

    @database_sync_to_async
    def get_complaint_status(self, complaint_id):
        complaint = Complaint.objects.filter(pk=complaint_id).first()
        return complaint.status if complaint else None
