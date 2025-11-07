import { Router, Request, Response } from 'express';
import suiService from '../services/sui.service';
import { SubscriptionTier } from '../types';

const router = Router();

/**
 * POST /api/subscribe/:feedId
 * Subscribe to a data feed
 */
router.post('/:feedId', async (req: Request, res: Response) => {
  try {
    const { feedId } = req.params;
    const { consumer, tier, paymentAmount } = req.body;

    // Validate tier
    const validTiers = [SubscriptionTier.PAY_PER_QUERY, SubscriptionTier.MONTHLY, SubscriptionTier.PREMIUM];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription tier'
      });
    }

    // Get feed to verify it exists and get pricing
    const feed = await suiService.getDataFeed(feedId);
    if (!feed) {
      return res.status(404).json({
        success: false,
        error: 'Feed not found'
      });
    }

    if (!feed.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Feed is not active'
      });
    }

    // Verify payment amount
    const requiredAmount = tier === SubscriptionTier.MONTHLY
      ? feed.monthlySubscriptionPrice
      : feed.pricePerQuery;

    if (paymentAmount < requiredAmount) {
      return res.status(400).json({
        success: false,
        error: `Insufficient payment. Required: ${requiredAmount}, Provided: ${paymentAmount}`
      });
    }

    // Create subscription on blockchain
    const subscriptionId = await suiService.subscribe(
      consumer || suiService.getAddress(),
      feedId,
      tier,
      paymentAmount
    );

    res.json({
      success: true,
      data: {
        subscriptionId,
        feedId,
        tier,
        paymentAmount
      }
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/subscriptions/:id
 * Get subscription details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const subscription = await suiService.getSubscription(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/subscriptions/:id/verify
 * Verify subscription access
 */
router.post('/:id/verify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { consumer } = req.body;

    if (!consumer) {
      return res.status(400).json({
        success: false,
        error: 'Consumer address required'
      });
    }

    const hasAccess = await suiService.checkAccess(id, consumer);

    res.json({
      success: true,
      data: {
        hasAccess,
        subscriptionId: id
      }
    });
  } catch (error: any) {
    console.error('Error verifying access:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
