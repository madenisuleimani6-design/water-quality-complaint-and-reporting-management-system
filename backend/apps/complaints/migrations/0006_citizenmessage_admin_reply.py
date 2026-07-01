from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0001_initial"),
        ("complaints", "0005_phone_otp_session"),
    ]

    operations = [
        migrations.AddField(
            model_name="citizenmessage",
            name="admin_reply",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="citizenmessage",
            name="admin_replied_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="citizenmessage",
            name="admin_replied_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="citizen_message_replies",
                to="users.staffuser",
            ),
        ),
    ]
