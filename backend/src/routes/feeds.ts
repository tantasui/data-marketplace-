import { Router, Request, Response } from 'express';
import walrusService from '../services/walrus.service';
import suiService from '../services/sui.service';
import { DataFeedMetadata } from '../types';

const router = Router();

/**
 * GET /api/feeds
 * Get all available data feeds with optional filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, isPremium, minPrice, maxPrice, location } = req.query;

    // Get all feeds from blockchain
    let feeds = await suiService.getAllDataFeeds();

    // Apply filters
    if (category) {
      feeds = feeds.filter(feed => feed.category === category);
    }

    if (isPremium !== undefined) {
      feeds = feeds.filter(feed => feed.isPremium === (isPremium === 'true'));
    }

    if (minPrice) {
      feeds = feeds.filter(feed =>
        feed.monthlySubscriptionPrice >= parseInt(minPrice as string)
      );
    }

    if (maxPrice) {
      feeds = feeds.filter(feed =>
        feed.monthlySubscriptionPrice <= parseInt(maxPrice as string)
      );
    }

    if (location) {
      feeds = feeds.filter(feed =>
        feed.location.toLowerCase().includes((location as string).toLowerCase())
      );
    }

    res.json({
      success: true,
      data: feeds,
      count: feeds.length
    });
  } catch (error: any) {
    console.error('Error fetching feeds:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/feeds/:id
 * Get details of a specific data feed
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const feed = await suiService.getDataFeed(id);

    if (!feed) {
      return res.status(404).json({
        success: false,
        error: 'Feed not found'
      });
    }

    res.json({
      success: true,
      data: feed
    });
  } catch (error: any) {
    console.error('Error fetching feed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/feeds
 * Register a new data feed
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      provider,
      name,
      category,
      description,
      location,
      pricePerQuery,
      monthlySubscriptionPrice,
      isPremium,
      updateFrequency,
      initialData
    } = req.body;

    // Validate required fields
    if (!name || !category || !description || !location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Upload initial data to Walrus
    const encrypt = isPremium === true;
    const walrusBlobId = await walrusService.uploadData(initialData, encrypt);

    // Create metadata
    const metadata: DataFeedMetadata = {
      name,
      category,
      description,
      location,
      pricePerQuery: pricePerQuery || 0,
      monthlySubscriptionPrice: monthlySubscriptionPrice || 0,
      isPremium: isPremium || false,
      updateFrequency: updateFrequency || 300
    };

    // Register on blockchain
    const feedId = await suiService.registerDataFeed(
      provider || suiService.getAddress(),
      metadata,
      walrusBlobId
    );

    res.json({
      success: true,
      data: {
        feedId,
        walrusBlobId
      }
    });
  } catch (error: any) {
    console.error('Error creating feed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/feeds/:id/data
 * Update feed with new data
 */
router.put('/:id/data', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, provider } = req.body;

    // Get feed details
    const feed = await suiService.getDataFeed(id);

    if (!feed) {
      return res.status(404).json({
        success: false,
        error: 'Feed not found'
      });
    }

    // Verify provider (in production, use proper authentication)
    if (provider && feed.provider !== provider) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Not the feed provider'
      });
    }

    // Upload new data to Walrus
    const encrypt = feed.isPremium;
    const newWalrusBlobId = await walrusService.uploadData(data, encrypt);

    // Update on blockchain
    const success = await suiService.updateFeedData(id, newWalrusBlobId);

    res.json({
      success,
      data: {
        feedId: id,
        newWalrusBlobId
      }
    });
  } catch (error: any) {
    console.error('Error updating feed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/feeds/:id/rating
 * Submit a rating for a feed
 */
router.post('/:id/rating', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stars, comment } = req.body;

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rating (must be 1-5)'
      });
    }

    const ratingId = await suiService.submitRating(id, stars, comment || '');

    res.json({
      success: true,
      data: {
        ratingId
      }
    });
  } catch (error: any) {
    console.error('Error submitting rating:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
