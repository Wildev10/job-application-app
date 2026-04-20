<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subjectLine }}</title>
</head>
<body style="margin:0;padding:24px;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#374151;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
    <tr>
        <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;border-collapse:collapse;background-color:#ffffff;border-radius:8px;overflow:hidden;">
                <tr>
                    <td style="padding:24px;border-bottom:1px solid #e5e7eb;">
                        <div style="font-size:14px;font-weight:700;color:#2563eb;letter-spacing:0.08em;text-transform:uppercase;">Vaybe</div>
                        <h1 style="margin:10px 0 0;font-size:22px;line-height:1.3;color:#111827;">{{ $subjectLine }}</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding:28px 24px;">
                        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">Bonjour {{ $companyName }},</p>
                        <p style="margin:0;font-size:15px;line-height:1.8;white-space:pre-line;">{{ $messageBody }}</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:20px 24px;background-color:#f9fafb;border-top:1px solid #e5e7eb;font-size:14px;line-height:1.6;">
                        Message de l'équipe Vaybe
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
