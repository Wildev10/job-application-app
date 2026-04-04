<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Candidature reçue</title>
</head>
<body style="margin:0;padding:24px;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#374151;">
@php
    $accentColor = $company->color ?: '#2563eb';
    $submittedAt = $application->created_at
        ? $application->created_at->locale('fr')->translatedFormat('d F Y à H:i')
        : now()->locale('fr')->translatedFormat('d F Y à H:i');
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
                        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;">
                            Nous avons bien reçu votre candidature pour le poste de <strong>{{ $application->role }}</strong> chez <strong>{{ $company->name }}</strong>.
                        </p>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:22px;">
                            <tr>
                                <td style="width:45%;padding:12px 14px;background-color:#f9fafb;font-weight:600;border-bottom:1px solid #e5e7eb;">Rôle</td>
                                <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;">{{ $application->role }}</td>
                            </tr>
                            <tr>
                                <td style="width:45%;padding:12px 14px;background-color:#f9fafb;font-weight:600;border-bottom:1px solid #e5e7eb;">Score obtenu</td>
                                <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;">{{ $application->score }}/5</td>
                            </tr>
                            <tr>
                                <td style="width:45%;padding:12px 14px;background-color:#f9fafb;font-weight:600;">Date de soumission</td>
                                <td style="padding:12px 14px;">{{ $submittedAt }}</td>
                            </tr>
                        </table>

                        <p style="margin:0;font-size:15px;line-height:1.7;">
                            Notre équipe va examiner votre profil dans les meilleurs délais. Vous serez contacté par email en cas d'évolution de votre dossier.
                        </p>
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
