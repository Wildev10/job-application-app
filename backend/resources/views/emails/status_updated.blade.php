<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mise à jour candidature</title>
</head>
<body style="margin:0;padding:24px;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#374151;">
@php
    $accentColor = $company->color ?: '#2563eb';
    $statusColorMap = [
        'blue' => '#2563eb',
        'yellow' => '#d97706',
        'green' => '#16a34a',
        'red' => '#dc2626',
        'gray' => '#6b7280',
    ];
    $badgeColor = $statusColorMap[$application->status_color] ?? '#6b7280';

    $statusMessages = [
        'reviewing' => 'Bonne nouvelle ! Votre candidature est en cours d\'examen par notre équipe.',
        'interview' => 'Félicitations ! Vous êtes sélectionné(e) pour un entretien. Notre équipe vous contactera très prochainement pour convenir d\'un rendez-vous.',
        'accepted' => "🎉 Félicitations ! Votre candidature a été acceptée. Bienvenue dans l'équipe {$company->name} !",
        'rejected' => "Nous avons bien examiné votre candidature et nous vous remercions de l'intérêt que vous portez à {$company->name}. Malheureusement, nous ne donnons pas suite à votre candidature pour le moment. Nous vous souhaitons bonne continuation.",
        'pending' => 'Votre candidature est en attente d\'examen.',
    ];

    $message = $statusMessages[$application->status] ?? $statusMessages['pending'];
    $siteUrl = rtrim((string) ($frontendUrl ?: config('app.frontend_url', 'http://localhost:3000')), '/');
@endphp
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
    <tr>
        <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;border-collapse:collapse;background-color:#ffffff;border-radius:8px;overflow:hidden;">
                <tr>
                    <td style="padding:24px;border-bottom:1px solid #e5e7eb;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                            <tr>
                                <td style="vertical-align:middle;">
                                    @if (!empty($company->logo))
                                        <img src="{{ $company->logo }}" alt="{{ $company->name }}" style="display:block;height:40px;max-width:140px;object-fit:contain;">
                                    @endif
                                </td>
                                <td style="text-align:right;vertical-align:middle;">
                                    <span style="font-size:20px;font-weight:700;color:{{ $accentColor }};">{{ $company->name }}</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding:28px 24px;">
                        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.35;color:#111827;">Bonjour {{ $application->nom }},</h1>
                        <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">{{ $message }}</p>

                        <div style="margin:8px 0 0;">
                            <span style="display:inline-block;padding:8px 12px;border-radius:999px;background-color:{{ $badgeColor }};color:#ffffff;font-size:13px;font-weight:700;line-height:1;">
                                {{ $application->status_label }}
                            </span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:20px 24px;background-color:#f9fafb;border-top:1px solid #e5e7eb;font-size:14px;line-height:1.6;">
                        <strong>L'équipe {{ $company->name }}</strong><br>
                        <a href="{{ $siteUrl }}" style="color:{{ $accentColor }};text-decoration:none;">{{ $siteUrl }}</a>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
