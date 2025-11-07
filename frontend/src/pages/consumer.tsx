import { useState, useEffect } from 'react';
import Layout from '@/components/common/Layout';
import { useSuiWallet } from '@/hooks/useSuiWallet';
import apiClient from '@/lib/api';

export default function ConsumerMarketplace() {
  const { isConnected, address } = useSuiWallet();
  const [feeds, setFeeds] = useState<any[]>([]);
  const [filteredFeeds, setFilteredFeeds] = useState<any[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<any | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    category: 'all',
    isPremium: 'all',
    location: '',
  });

  useEffect(() => {
    loadFeeds();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [feeds, filters]);

  const loadFeeds = async () => {
    try {
      const response = await apiClient.getAllFeeds();
      setFeeds(response.data || []);
    } catch (error) {
      console.error('Error loading feeds:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...feeds];

    if (filters.category !== 'all') {
      filtered = filtered.filter((feed) => feed.category === filters.category);
    }

    if (filters.isPremium === 'premium') {
      filtered = filtered.filter((feed) => feed.isPremium);
    } else if (filters.isPremium === 'free') {
      filtered = filtered.filter((feed) => !feed.isPremium);
    }

    if (filters.location) {
      filtered = filtered.filter((feed) =>
        feed.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredFeeds(filtered);
  };

  const handlePreview = async (feed: any) => {
    setSelectedFeed(feed);
    setIsLoading(true);

    try {
      const response = await apiClient.getData(feed.id, { preview: true });
      setPreviewData(response.data);
    } catch (error) {
      console.error('Error loading preview:', error);
      setPreviewData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (feed: any, tier: number) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    const price = tier === 1 ? feed.monthlySubscriptionPrice : feed.pricePerQuery;
    const priceInSui = price / 1_000_000_000;

    const confirm = window.confirm(
      `Subscribe to ${feed.name} for ${priceInSui.toFixed(4)} SUI?`
    );

    if (!confirm) return;

    try {
      const response = await apiClient.subscribe(feed.id, {
        consumer: address,
        tier,
        paymentAmount: price,
      });

      if (response.success) {
        alert(`Successfully subscribed! Subscription ID: ${response.data.subscriptionId}`);
        // Store subscription ID in localStorage for demo
        const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '{}');
        subscriptions[feed.id] = response.data.subscriptionId;
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
      }
    } catch (error: any) {
      console.error('Error subscribing:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Data Marketplace</h1>
        <p className="text-gray-600">Browse and subscribe to real-time IoT data feeds</p>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <h2 className="text-lg font-bold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              className="input"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="all">All Categories</option>
              <option value="weather">Weather</option>
              <option value="traffic">Traffic</option>
              <option value="air_quality">Air Quality</option>
              <option value="parking">Parking</option>
              <option value="energy">Energy</option>
              <option value="smart_home">Smart Home</option>
              <option value="industrial">Industrial</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              className="input"
              value={filters.isPremium}
              onChange={(e) => setFilters({ ...filters, isPremium: e.target.value })}
            >
              <option value="all">All Types</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              className="input"
              placeholder="Search location..."
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Feed Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Available Feeds</h2>
          <span className="text-gray-600">{filteredFeeds.length} feeds found</span>
        </div>

        {filteredFeeds.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No data feeds match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeeds.map((feed) => (
              <div key={feed.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold">{feed.name}</h3>
                  {feed.isPremium ? (
                    <span className="badge-premium">Premium</span>
                  ) : (
                    <span className="badge-free">Free</span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{feed.description}</p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium capitalize">{feed.category.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{feed.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Update Freq:</span>
                    <span className="font-medium">Every {feed.updateFrequency}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Price:</span>
                    <span className="font-medium text-blue-600">
                      {(feed.monthlySubscriptionPrice / 1_000_000_000).toFixed(4)} SUI
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subscribers:</span>
                    <span className="font-medium">{feed.totalSubscribers}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handlePreview(feed)}
                    className="btn-secondary w-full text-sm"
                  >
                    Preview Data
                  </button>
                  <button
                    onClick={() => handleSubscribe(feed, 1)}
                    className="btn-primary w-full text-sm"
                    disabled={!isConnected}
                  >
                    {isConnected ? 'Subscribe' : 'Connect Wallet'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedFeed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedFeed.name}</h2>
                  <p className="text-gray-600">{selectedFeed.description}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedFeed(null);
                    setPreviewData(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-2">Feed Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium capitalize">{selectedFeed.category.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2 font-medium">{selectedFeed.location}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Monthly Price:</span>
                    <span className="ml-2 font-medium">
                      {(selectedFeed.monthlySubscriptionPrice / 1_000_000_000).toFixed(4)} SUI
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Update Frequency:</span>
                    <span className="ml-2 font-medium">Every {selectedFeed.updateFrequency}s</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-2">Data Preview</h3>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading preview...</p>
                  </div>
                ) : previewData ? (
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(previewData, null, 2)}
                  </pre>
                ) : (
                  <p className="text-gray-600">No preview available</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleSubscribe(selectedFeed, 1)}
                  className="btn-primary flex-1"
                  disabled={!isConnected}
                >
                  Subscribe Now
                </button>
                <button
                  onClick={() => {
                    setSelectedFeed(null);
                    setPreviewData(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
