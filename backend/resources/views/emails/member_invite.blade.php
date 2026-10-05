<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation recruteur</title>
</head>
<body style="margin:0;padding:24px;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#374151;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
    <tr>
        <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;border-collapse:collapse;background-color:#ffffff;border-radius:8px;overflow:hidden;">
                <tr>
                    <td style="padding:24px;border-bottom:1px solid #e5e7eb;">
                        <span style="font-size:20px;font-weight:700;color:#F2600C;">{{ $company->name }}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding:28px 24px;">
                        <h1 style="margin:0 0 16px;font-size:22px;color:#111827;">Vous avez été invité(e) à rejoindre l'équipe recrutement</h1>
                        <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#374151;">
                            <strong>{{ $company->name }}</strong> vous invite à accéder à son espace de gestion des candidatures sur Vaybe.
                        </p>
                        <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
                            Cliquez sur le bouton ci-dessous pour créer votre accès et rejoindre l'équipe.
                        </p>
                        <a href="{{ $acceptUrl }}" style="display:inline-block;padding:12px 28px;background-color:#F2600C;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px;">
                            Accepter l'invitation
                        </a>
                        <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">Ce lien expire dans 48 heures. Si vous n'attendiez pas cette invitation, ignorez cet email.</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:16px 24px;background-color:#f9fafb;border-top:1px solid #e5e7eb;font-size:13px;color:#6b7280;">
                        L'équipe Vaybe Recrutement
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
