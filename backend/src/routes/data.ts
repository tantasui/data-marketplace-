import { Router, Request, Response } from 'express';
import walrusService from '../services/walrus.service';
import suiService from '../services/sui.service';
import NodeCache from 'node-cache';

const router = Router();
const cache = new NodeCache({ stdTTL: parseInt(process.env.CACHE_TTL || '300') });

/**
 * GET /api/data/:feedId
 * Retrieve data from a feed (requires valid subscription)
 */
router.get('/:feedId', async (req: Request, res: Response) => {
  try {
    const { feedId } = req.params;
    const { subscriptionId, consumer, preview } = req.query;

    // Get feed details
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

    // If preview mode, return limited data
    if (preview === 'true') {
      const cacheKey = `preview_${feedId}`;
      let previewData = cache.get(cacheKey);

      if (!previewData) {
        const fullData = await walrusService.retrieveData(feed.walrusBlobId);

        // Return only a sample of the data for preview
        if (Array.isArray(fullData)) {
          previewData = fullData.slice(0, 3);
        } else if (typeof fullData === 'object') {
          previewData = { sample: 'Preview data available after subscription' };
        } else {
          previewData = 'Preview: Subscribe to access full data';
        }

        cache.set(cacheKey, previewData);
      }

      return res.json({
        success: true,
        preview: true,
        data: previewData,
        feed: {
          name: feed.name,
          category: feed.category,
          description: feed.description,
          location: feed.location
        }
      });
    }

    // Verify subscription access
    if (!subscriptionId || !consumer) {
      return res.status(401).json({
        success: false,
        error: 'Subscription ID and consumer address required'
      });
    }

    const hasAccess = await suiService.checkAccess(
      subscriptionId as string,
      consumer as string
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Invalid or expired subscription.'
      });
    }

    // Check cache first
    const cacheKey = `data_${feedId}`;
    let data = cache.get(cacheKey);

    if (!data) {
      // Retrieve data from Walrus
      if (feed.isPremium) {
        // For premium feeds, we need decryption key
        // In production, this would come from Seal encryption
        const decryptionKey = req.headers['x-decryption-key'] as string;
        data = await walrusService.retrieveData(feed.walrusBlobId, decryptionKey);
      } else {
        data = await walrusService.retrieveData(feed.walrusBlobId);
      }

      // Cache the data
      cache.set(cacheKey, data);
    }

    res.json({
      success: true,
      data,
      feed: {
        id: feed.id,
        name: feed.name,
        category: feed.category,
        lastUpdated: feed.lastUpdated
      }
    });
  } catch (error: any) {
    console.error('Error retrieving data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/data/:feedId/stream
 * WebSocket endpoint for real-time data streaming (handled in index.ts)
 */

/**
 * GET /api/data/:feedId/history
 * Get historical data for a feed
 */
router.get('/:feedId/history', async (req: Request, res: Response) => {
  try {
    const { feedId } = req.params;
    const { subscriptionId, consumer, limit } = req.query;

    // Verify subscription access
    if (!subscriptionId || !consumer) {
      return res.status(401).json({
        success: false,
        error: 'Subscription ID and consumer address required'
      });
    }

    const hasAccess = await suiService.checkAccess(
      subscriptionId as string,
      consumer as string
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Invalid or expired subscription.'
      });
    }

    // In a real implementation, you would query historical blob IDs
    // For now, return the current data as a single history point
    const feed = await suiService.getDataFeed(feedId);

    if (!feed) {
      return res.status(404).json({
        success: false,
        error: 'Feed not found'
      });
    }

    const currentData = await walrusService.retrieveData(feed.walrusBlobId);

    res.json({
      success: true,
      data: [{
        timestamp: feed.lastUpdated,
        data: currentData
      }],
      count: 1
    });
  } catch (error: any) {
    console.error('Error retrieving history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/data/upload
 * Upload data to Walrus (utility endpoint)
 */
router.post('/upload', async (req: Request, res: Response) => {
  try {
    const { data, encrypt } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required'
      });
    }

    const blobId = await walrusService.uploadData(data, encrypt || false);

    res.json({
      success: true,
      data: {
        blobId
      }
    });
  } catch (error: any) {
    console.error('Error uploading data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
