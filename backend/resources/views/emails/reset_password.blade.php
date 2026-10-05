<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation du mot de passe</title>
</head>
<body style="margin:0;padding:24px;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
    <tr>
        <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;border-collapse:collapse;background:#ffffff;border-radius:12px;overflow:hidden;">
                <tr>
                    <td style="padding:24px;border-bottom:1px solid #e2e8f0;">
                        <h1 style="margin:0;font-size:24px;color:#0f172a;">Bonjour {{ $company->name }},</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px;font-size:15px;line-height:1.7;">
                        <p style="margin:0 0 14px;">Vous avez demandé la réinitialisation de votre mot de passe.</p>
                        <p style="margin:0 0 22px;">Cliquez sur le bouton ci-dessous pour en choisir un nouveau. Ce lien est valable 60 minutes.</p>
                        <a href="{{ $resetUrl }}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px;">Choisir un nouveau mot de passe →</a>
                        <p style="margin:22px 0 0;font-size:13px;color:#475569;">Si vous n'avez pas fait cette demande, ignorez ce message : votre mot de passe reste inchangé.</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:13px;color:#475569;">
                        L'équipe Vaybe Recrutement
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
