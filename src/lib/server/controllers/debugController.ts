import { Request, Response } from 'express';
import prisma from '@/lib/server/db/prisma';

/**
 * Debug endpoint: Get payment signature info
 * GET /api/debug/payment-signature?paymentId=PAY...
 */
export async function getPaymentSignature(req: Request, res: Response): Promise<void> {
  try {
    const { paymentId } = req.query;

    if (!paymentId || typeof paymentId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'paymentId query param required'
      });
      return;
    }

    // Get all logs for this payment
    const logs = await prisma.payment_logs.findMany({
      where: { payment_id: paymentId },
      orderBy: { created_at: 'desc' }
    });

    const signLog = logs.find((l) => l.log_type === 'SIGN');

    if (!signLog) {
      res.status(404).json({
        success: false,
        message: 'No SIGN log found for this payment',
        paymentId,
        allLogs: logs.map((l) => ({ log_type: l.log_type, message: l.message }))
      });
      return;
    }

    let signData = {};
    try {
      signData = JSON.parse(signLog.new_data || '{}');
    } catch (e) {
      //
    }

    res.status(200).json({
      success: true,
      paymentId,
      signLog: {
        log_type: signLog.log_type,
        message: signLog.message,
        created_at: signLog.created_at,
        data: signData
      },
      allLogs: logs.map((l) => ({
        log_type: l.log_type,
        message: l.message,
        created_at: l.created_at
      }))
    });
  } catch (error) {
    console.error('Debug payment signature error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment logs'
    });
  }
}
