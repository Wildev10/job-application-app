<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Mail\BroadcastMail;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Throwable;

class BroadcastController extends Controller
{
    /**
     * Queue a broadcast email to targeted companies.
     */
    public function send(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'target' => ['required', 'in:all,pro,starter'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422)->header('Content-Type', 'application/json');
        }

        try {
            $data = $validator->validated();

            $query = Company::query();

            if ($data['target'] === 'all') {
                $query->where('is_suspended', false);
            }

            if ($data['target'] === 'pro') {
                $query->where('plan', 'pro');
            }

            if ($data['target'] === 'starter') {
                $query->where('plan', 'starter');
            }

            /** @var \Illuminate\Support\Collection<int, Company> $companies */
            $companies = $query->get(['id', 'name', 'email']);

            $companies->each(static function (Company $company) use ($data): void {
                Mail::to($company->email)->queue(new BroadcastMail(
                    (string) $data['subject'],
                    (string) $data['message'],
                    $company->name,
                ));
            });

            $sentTo = $companies->count();

            return response()->json([
                'sent_to' => $sentTo,
                'message' => "Email envoyé à {$sentTo} entreprises",
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Impossible d\'envoyer le broadcast.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }
}
