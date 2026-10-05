<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle candidature reçue</title>
</head>
<body style="margin:0;padding:24px;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#374151;">
@php
    $accentColor = $company->color ?: '#2563eb';
    $siteUrl = rtrim((string) ($frontendUrl ?: config('app.frontend_url', 'http://localhost:3000')), '/');
@endphp
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
    <tr>
        <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;border-collapse:collapse;background-color:#ffffff;border-radius:8px;overflow:hidden;">
                <tr>
                    <td style="padding:24px;border-bottom:1px solid #e5e7eb;">
                        <h1 style="margin:0;font-size:22px;line-height:1.3;color:#111827;">Nouvelle candidature reçue</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding:28px 24px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
                            <tr>
                                <td style="width:40%;padding:12px 14px;background-color:#f9fafb;font-weight:600;border-bottom:1px solid #e5e7eb;">Nom</td>
                                <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;">{{ $application->nom }}</td>
                            </tr>
                            <tr>
                                <td style="width:40%;padding:12px 14px;background-color:#f9fafb;font-weight:600;border-bottom:1px solid #e5e7eb;">Email</td>
                                <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;">{{ $application->email }}</td>
                            </tr>
                            <tr>
                                <td style="width:40%;padding:12px 14px;background-color:#f9fafb;font-weight:600;border-bottom:1px solid #e5e7eb;">Rôle</td>
                                <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;">{{ $application->role }}</td>
                            </tr>
                            <tr>
                                <td style="width:40%;padding:12px 14px;background-color:#f9fafb;font-weight:600;border-bottom:1px solid #e5e7eb;">Score</td>
                                <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;">{{ $application->score }}/5</td>
                            </tr>
                            <tr>
                                <td style="width:40%;padding:12px 14px;background-color:#f9fafb;font-weight:600;border-bottom:1px solid #e5e7eb;">Portfolio</td>
                                <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;">
                                    @if (!empty($application->portfolio))
                                        <a href="{{ $application->portfolio }}" style="color:{{ $accentColor }};text-decoration:none;" target="_blank" rel="noopener noreferrer">{{ $application->portfolio }}</a>
                                    @else
                                        Non renseigné
                                    @endif
                                </td>
                            </tr>
                            <tr>
                                <td style="width:40%;padding:12px 14px;background-color:#f9fafb;font-weight:600;vertical-align:top;">Message de motivation</td>
                                <td style="padding:12px 14px;white-space:pre-line;">{{ $application->motivation }}</td>
                            </tr>
                        </table>

                        <div style="margin-top:24px;">
                            <a href="{{ $adminUrl }}" style="display:inline-block;padding:12px 18px;background-color:{{ $accentColor }};color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">
                                Voir la candidature
                            </a>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:20px 24px;background-color:#f9fafb;border-top:1px solid #e5e7eb;font-size:14px;line-height:1.6;">
                        <strong>L'équipe {{ $company->name }}</strong><br>
                        <a href="{{ $siteUrl }}" style="color:{{ $accentColor }};text-decoration:none;">{{ $siteUrl }}</a><br>
                        Notification automatique RH
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
