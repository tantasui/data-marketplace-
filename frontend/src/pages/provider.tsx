import { useState, useEffect } from 'react';
import Layout from '@/components/common/Layout';
import { useSuiWallet } from '@/hooks/useSuiWallet';
import apiClient from '@/lib/api';

export default function ProviderDashboard() {
  const { isConnected, address } = useSuiWallet();
  const [feeds, setFeeds] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'weather',
    description: '',
    location: '',
    pricePerQuery: 0,
    monthlySubscriptionPrice: 0.1,
    isPremium: false,
    updateFrequency: 300,
    initialData: '',
  });

  useEffect(() => {
    if (isConnected && address) {
      loadMyFeeds();
    }
  }, [isConnected, address]);

  const loadMyFeeds = async () => {
    try {
      const response = await apiClient.getAllFeeds();
      // Filter feeds owned by current user
      const myFeeds = response.data.filter((feed: any) => feed.provider === address);
      setFeeds(myFeeds);
    } catch (error) {
      console.error('Error loading feeds:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Parse initial data
      let parsedData;
      try {
        parsedData = JSON.parse(formData.initialData);
      } catch {
        parsedData = formData.initialData;
      }

      // Create feed
      const response = await apiClient.createFeed({
        provider: address,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        location: formData.location,
        pricePerQuery: Math.floor(formData.pricePerQuery * 1_000_000_000), // Convert to MIST
        monthlySubscriptionPrice: Math.floor(formData.monthlySubscriptionPrice * 1_000_000_000),
        isPremium: formData.isPremium,
        updateFrequency: formData.updateFrequency,
        initialData: parsedData,
      });

      if (response.success) {
        alert('Feed created successfully!');
        setShowCreateForm(false);
        loadMyFeeds();
        // Reset form
        setFormData({
          name: '',
          category: 'weather',
          description: '',
          location: '',
          pricePerQuery: 0,
          monthlySubscriptionPrice: 0.1,
          isPremium: false,
          updateFrequency: 300,
          initialData: '',
        });
      }
    } catch (error: any) {
      console.error('Error creating feed:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateData = async (feedId: string) => {
    const newData = prompt('Enter new data (JSON format):');
    if (!newData) return;

    try {
      let parsedData;
      try {
        parsedData = JSON.parse(newData);
      } catch {
        parsedData = newData;
      }

      const response = await apiClient.updateFeedData(feedId, parsedData, address);

      if (response.success) {
        alert('Data updated successfully!');
        loadMyFeeds();
      }
    } catch (error: any) {
      console.error('Error updating data:', error);
      alert(`Error: ${error.message}`);
    }
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Provider Dashboard</h1>
          <p className="text-gray-600 mb-8">
            Please connect your wallet to access the provider dashboard.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
            <p className="text-gray-600">Manage your data feeds and track earnings</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            {showCreateForm ? 'Cancel' : '+ Create New Feed'}
          </button>
        </div>

        {/* Create Feed Form */}
        {showCreateForm && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-4">Create New Data Feed</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Feed Name</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    className="input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
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
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., San Francisco, CA"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Update Frequency (seconds)</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.updateFrequency}
                    onChange={(e) => setFormData({ ...formData, updateFrequency: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price per Query (SUI)</label>
                  <input
                    type="number"
                    step="0.001"
                    className="input"
                    value={formData.pricePerQuery}
                    onChange={(e) => setFormData({ ...formData, pricePerQuery: parseFloat(e.target.value) })}
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Subscription (SUI)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={formData.monthlySubscriptionPrice}
                    onChange={(e) => setFormData({ ...formData, monthlySubscriptionPrice: parseFloat(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Initial Data (JSON)</label>
                <textarea
                  className="input font-mono text-sm"
                  rows={6}
                  value={formData.initialData}
                  onChange={(e) => setFormData({ ...formData, initialData: e.target.value })}
                  placeholder='{"temperature": 72, "humidity": 45}'
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isPremium" className="text-sm font-medium">
                  Premium Feed (Seal encrypted)
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Feed'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* My Feeds */}
        <div>
          <h2 className="text-2xl font-bold mb-4">My Data Feeds</h2>
          {feeds.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 mb-4">You haven't created any data feeds yet.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                Create Your First Feed
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feeds.map((feed) => (
                <div key={feed.id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold">{feed.name}</h3>
                    {feed.isPremium ? (
                      <span className="badge-premium">Premium</span>
                    ) : (
                      <span className="badge-free">Free</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{feed.description}</p>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{feed.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{feed.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subscribers:</span>
                      <span className="font-medium">{feed.totalSubscribers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium">{(feed.totalRevenue / 1_000_000_000).toFixed(4)} SUI</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpdateData(feed.id)}
                    className="btn-primary w-full text-sm"
                  >
                    Update Data
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
