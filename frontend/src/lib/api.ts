import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // =================== Feeds ===================

  async getAllFeeds(params?: {
    category?: string;
    isPremium?: boolean;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
  }) {
    const response = await this.client.get('/api/feeds', { params });
    return response.data;
  }

  async getFeed(id: string) {
    const response = await this.client.get(`/api/feeds/${id}`);
    return response.data;
  }

  async createFeed(feedData: {
    provider?: string;
    name: string;
    category: string;
    description: string;
    location: string;
    pricePerQuery?: number;
    monthlySubscriptionPrice?: number;
    isPremium?: boolean;
    updateFrequency?: number;
    initialData: any;
  }) {
    const response = await this.client.post('/api/feeds', feedData);
    return response.data;
  }

  async updateFeedData(feedId: string, data: any, provider?: string) {
    const response = await this.client.put(`/api/feeds/${feedId}/data`, {
      data,
      provider,
    });
    return response.data;
  }

  async submitRating(feedId: string, stars: number, comment: string) {
    const response = await this.client.post(`/api/feeds/${feedId}/rating`, {
      stars,
      comment,
    });
    return response.data;
  }

  // =================== Subscriptions ===================

  async subscribe(feedId: string, params: {
    consumer?: string;
    tier: number;
    paymentAmount: number;
  }) {
    const response = await this.client.post(`/api/subscribe/${feedId}`, params);
    return response.data;
  }

  async getSubscription(subscriptionId: string) {
    const response = await this.client.get(`/api/subscriptions/${subscriptionId}`);
    return response.data;
  }

  async verifyAccess(subscriptionId: string, consumer: string) {
    const response = await this.client.post(`/api/subscriptions/${subscriptionId}/verify`, {
      consumer,
    });
    return response.data;
  }

  // =================== Data ===================

  async getData(feedId: string, params: {
    subscriptionId?: string;
    consumer?: string;
    preview?: boolean;
  }) {
    const response = await this.client.get(`/api/data/${feedId}`, { params });
    return response.data;
  }

  async getDataHistory(feedId: string, subscriptionId: string, consumer: string, limit?: number) {
    const response = await this.client.get(`/api/data/${feedId}/history`, {
      params: { subscriptionId, consumer, limit },
    });
    return response.data;
  }

  async uploadData(data: any, encrypt?: boolean) {
    const response = await this.client.post('/api/data/upload', {
      data,
      encrypt,
    });
    return response.data;
  }

  // =================== Health ===================

  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
