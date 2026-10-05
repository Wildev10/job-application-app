<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paiement confirmé</title>
</head>
<body style="margin:0;padding:24px;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
@php
    $paidAt = $payment->paid_at
        ? $payment->paid_at->locale('fr')->translatedFormat('d F Y à H:i')
        : now()->locale('fr')->translatedFormat('d F Y à H:i');
    $periodEnd = $payment->period_end
        ? $payment->period_end->locale('fr')->translatedFormat('d F Y')
        : '-';
    $paymentMethod = $payment->payment_method ?: 'Mobile Money';
@endphp
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
    <tr>
        <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;border-collapse:collapse;background-color:#ffffff;border-radius:12px;overflow:hidden;">
                <tr>
                    <td style="padding:22px 24px;border-bottom:1px solid #e2e8f0;background-color:#f8fafc;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                            <tr>
                                <td style="font-size:20px;font-weight:700;color:#0f766e;">Vaybe Recrutement</td>
                                <td style="text-align:right;font-size:16px;font-weight:700;color:#0f766e;">Paiement confirmé ✓</td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding:28px 24px;">
                        <h1 style="margin:0 0 14px;font-size:24px;color:#0f172a;">Bonjour {{ $company->name }},</h1>
                        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
                            Votre paiement a bien été reçu et votre compte est maintenant en plan Pro !
                        </p>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #dbeafe;border-radius:8px;overflow:hidden;margin-bottom:18px;">
                            <tr>
                                <td style="padding:11px 12px;background:#f8fafc;font-weight:600;border-bottom:1px solid #dbeafe;width:42%;">Plan</td>
                                <td style="padding:11px 12px;border-bottom:1px solid #dbeafe;">Pro</td>
                            </tr>
                            <tr>
                                <td style="padding:11px 12px;background:#f8fafc;font-weight:600;border-bottom:1px solid #dbeafe;">Montant</td>
                                <td style="padding:11px 12px;border-bottom:1px solid #dbeafe;">{{ $payment->amount_formatted }}</td>
                            </tr>
                            <tr>
                                <td style="padding:11px 12px;background:#f8fafc;font-weight:600;border-bottom:1px solid #dbeafe;">Méthode</td>
                                <td style="padding:11px 12px;border-bottom:1px solid #dbeafe;">{{ $paymentMethod }}</td>
                            </tr>
                            <tr>
                                <td style="padding:11px 12px;background:#f8fafc;font-weight:600;border-bottom:1px solid #dbeafe;">Date</td>
                                <td style="padding:11px 12px;border-bottom:1px solid #dbeafe;">{{ $paidAt }}</td>
                            </tr>
                            <tr>
                                <td style="padding:11px 12px;background:#f8fafc;font-weight:600;">Valide jusqu'au</td>
                                <td style="padding:11px 12px;">{{ $periodEnd }}</td>
                            </tr>
                        </table>

                        <p style="margin:0 0 20px;font-size:14px;color:#334155;">
                            Transaction ID: <strong>{{ $payment->fedapay_transaction_id }}</strong>
                        </p>

                        <a href="{{ $frontendUrl }}/admin" style="display:inline-block;background-color:#0f766e;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px;">Accéder à mon espace Pro →</a>
                    </td>
                </tr>
                <tr>
                    <td style="padding:18px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:13px;color:#475569;">
                        Merci de votre confiance,<br>
                        L'équipe Vaybe Recrutement
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
