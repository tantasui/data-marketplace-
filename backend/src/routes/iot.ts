import { Router, Request, Response } from 'express';
import walrusService from '../services/walrus.service';
import suiService from '../services/sui.service';

const router = Router();

/**
 * POST /api/iot/update
 * Endpoint for IoT devices (like Wokwi simulator) to push data
 */
router.post('/update', async (req: Request, res: Response) => {
  try {
    const { feedId, deviceId, data, provider } = req.body;

    console.log('📡 IoT device data received:', {
      feedId,
      deviceId,
      dataKeys: Object.keys(data || {}),
      timestamp: Date.now()
    });

    // Validate required fields
    if (!feedId || !data) {
      return res.status(400).json({
        success: false,
        error: 'feedId and data are required'
      });
    }

    // Add metadata
    const enrichedData = {
      ...data,
      deviceId: deviceId || 'unknown',
      receivedAt: Date.now(),
      source: 'iot_device'
    };

    // Upload to Walrus
    console.log('📤 Uploading to Walrus...');
    const blobId = await walrusService.uploadData(enrichedData, false);
    console.log(`✅ Uploaded to Walrus: ${blobId}`);

    // Update on-chain (if provider address provided)
    if (provider) {
      try {
        console.log('⛓️  Updating on-chain...');
        await suiService.updateFeedData(feedId, blobId);
        console.log('✅ On-chain update successful');
      } catch (error: any) {
        console.warn('⚠️  On-chain update failed (continuing anyway):', error.message);
        // Continue even if on-chain update fails - data is still in Walrus
      }
    }

    res.json({
      success: true,
      message: 'Data updated successfully',
      blobId,
      feedId,
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('❌ Error from IoT device:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/iot/status
 * Check IoT endpoint status
 */
router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'online',
    endpoint: '/api/iot/update',
    timestamp: Date.now()
  });
});

export default router;
