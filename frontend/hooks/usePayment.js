'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Alert } from '@/lib/sweetalert';

const POLLING_INTERVAL_MS = 3000;
const POLLING_TIMEOUT_MS = 10 * 60 * 1000;
const PENDING_PAYMENT_ID_KEY = 'pending_payment_id';

/**
 * Manage payment initiation and polling flow for FedaPay transactions.
 */
export function usePayment({ refreshPlanStatus } = {}) {
  const [initiating, setInitiating] = useState(false);
  const [polling, setPolling] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [currentPaymentId, setCurrentPaymentId] = useState(null);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  /**
   * Stop all polling timers and reset polling state.
   */
  const stopPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setPolling(false);
  }, []);

  /**
   * Request the latest status for a specific payment.
   */
  const checkPaymentStatus = useCallback(async (paymentId) => {
    return apiFetch(`/payments/status/${paymentId}`, { method: 'GET' });
  }, []);

  /**
   * Start polling the backend until a final payment status is reached.
   */
  const startPolling = useCallback((paymentId) => {
    if (typeof window === 'undefined' || !paymentId) {
      return;
    }

    stopPolling();

    setPolling(true);
    setCurrentPaymentId(Number(paymentId));

    const poll = async () => {
      try {
        const payment = await checkPaymentStatus(paymentId);
        const status = payment?.status || null;

        if (!status) {
          return;
        }

        if (status === 'approved') {
          stopPolling();
          setPaymentStatus('approved');
          window.localStorage.removeItem(PENDING_PAYMENT_ID_KEY);

          if (typeof refreshPlanStatus === 'function') {
            await refreshPlanStatus();
          }

          return;
        }

        if (status === 'canceled' || status === 'declined') {
          stopPolling();
          setPaymentStatus(status);
          window.localStorage.removeItem(PENDING_PAYMENT_ID_KEY);
        }
      } catch {
        // Keep polling for transient network issues.
      }
    };

    void poll();

    intervalRef.current = window.setInterval(() => {
      void poll();
    }, POLLING_INTERVAL_MS);

    timeoutRef.current = window.setTimeout(() => {
      stopPolling();
    }, POLLING_TIMEOUT_MS);
  }, [checkPaymentStatus, refreshPlanStatus, stopPolling]);

  /**
   * Initiate payment and redirect user to FedaPay checkout URL.
   */
  const initiatePayment = useCallback(async () => {
    setInitiating(true);

    try {
      const payload = await apiFetch('/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const paymentId = payload?.payment_id;
      const paymentUrl = payload?.payment_url;

      if (!paymentId || !paymentUrl) {
        throw new Error('Réponse de paiement invalide.');
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(PENDING_PAYMENT_ID_KEY, String(paymentId));
        window.location.href = paymentUrl;
      }
    } catch (error) {
      await Alert.fire({
        icon: 'error',
        title: 'Paiement impossible',
        text: error instanceof Error ? error.message : 'Une erreur est survenue.',
        confirmButtonColor: '#0D9488',
      });
    } finally {
      setInitiating(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const pendingId = window.localStorage.getItem(PENDING_PAYMENT_ID_KEY);
    if (pendingId) {
      startPolling(Number(pendingId));
    }

    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  return {
    initiating,
    polling,
    paymentStatus,
    currentPaymentId,
    initiatePayment,
    checkPaymentStatus,
    startPolling,
    stopPolling,
  };
}
