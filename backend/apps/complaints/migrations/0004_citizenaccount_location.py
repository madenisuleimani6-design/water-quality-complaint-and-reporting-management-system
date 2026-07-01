from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("complaints", "0003_citizen_account_reporter_name"),
    ]

    operations = [
        migrations.AddField(
            model_name="citizenaccount",
            name="latitude",
            field=models.DecimalField(
                blank=True,
                decimal_places=6,
                max_digits=9,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="citizenaccount",
            name="longitude",
            field=models.DecimalField(
                blank=True,
                decimal_places=6,
                max_digits=9,
                null=True,
            ),
        ),
    ]
