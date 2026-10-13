<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre plan Pro expire bientôt</title>
</head>
<body style="margin:0;padding:24px;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#374151;">
@php
    $accentColor = '#F2600C';
    $expiresAt = $company->plan_expires_at?->locale('fr')->isoFormat('D MMMM YYYY');
@endphp
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
    <tr>
        <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;border-collapse:collapse;background-color:#ffffff;border-radius:8px;overflow:hidden;">
                <tr>
                    <td style="padding:24px;border-bottom:1px solid #e5e7eb;">
                        <span style="font-size:20px;font-weight:700;color:{{ $accentColor }};">Vaybe Recrutement</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding:28px 24px;">
                        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.35;color:#111827;">
                            ⏳ Votre plan Pro expire dans {{ $daysLeft }} jour{{ $daysLeft > 1 ? 's' : '' }}
                        </h1>
                        <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#374151;">
                            Bonjour {{ $company->name }},
                        </p>
                        <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#374151;">
                            Votre abonnement Pro arrive à échéance le <strong>{{ $expiresAt }}</strong>.
                            Pour continuer à bénéficier de postes illimités, candidatures illimitées et de l'export CSV, renouvelez votre plan dès maintenant.
                        </p>
                        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#374151;">
                            Sans renouvellement, votre compte basculera automatiquement sur le plan Starter au-delà de cette date.
                        </p>

                        <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 20px;">
                            <tr>
                                <td style="background-color:{{ $accentColor }};border-radius:8px;">
                                    <a href="{{ $renewUrl }}"
                                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">
                                        Renouveler mon plan Pro →
                                    </a>
                                </td>
                            </tr>
                        </table>

                        <p style="margin:0;font-size:13px;color:#9ca3af;">
                            Ce lien est valide uniquement depuis votre compte. Aucun renouvellement automatique ne sera effectué sans votre action.
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:20px 24px;background-color:#f9fafb;border-top:1px solid #e5e7eb;font-size:14px;line-height:1.6;color:#374151;">
                        <strong>L'équipe Vaybe</strong><br>
                        <a href="{{ rtrim(config('app.frontend_url', ''), '/') }}" style="color:{{ $accentColor }};text-decoration:none;">vaybe.io</a>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
