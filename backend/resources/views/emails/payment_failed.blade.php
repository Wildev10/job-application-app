<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paiement échoué</title>
</head>
<body style="margin:0;padding:24px;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
    <tr>
        <td align="center">
            <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;border-collapse:collapse;background:#ffffff;border-radius:10px;overflow:hidden;">
                <tr>
                    <td style="padding:24px;border-bottom:1px solid #e2e8f0;">
                        <h1 style="margin:0;font-size:22px;">Bonjour {{ $company?->name ?? 'Entreprise' }},</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px;font-size:15px;line-height:1.7;">
                        <p style="margin:0 0 12px;">Votre paiement n'a pas abouti.</p>
                        <p style="margin:0 0 22px;">Vous pouvez réessayer depuis votre espace.</p>
                        <a href="{{ $frontendUrl }}/admin/upgrade" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px;">Réessayer →</a>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
