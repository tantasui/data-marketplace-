/**
 * Subscriber API Key Manager Component
 * For managing subscriber API keys (sk_xxx)
 */

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import type { ApiKey } from '@/types/api';

interface SubscriberApiKeyManagerProps {
  subscriptionId: string;
  consumerAddress: string;
  feedId: string;
  onKeyCreated?: () => void;
}

export default function SubscriberApiKeyManager({ 
  subscriptionId, 
  consumerAddress,
  feedId,
  onKeyCreated 
}: SubscriberApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    expiresAt: '',
  });

  const loadApiKeys = async () => {
    try {
      const response = await apiClient.getSubscriberApiKeys(consumerAddress);
      if (response && 'success' in response && response.success) {
        // Filter keys for this subscription
        const subscriptionKeys = (response.data || []).filter(
          (key: ApiKey) => key.subscriptionId === subscriptionId
        );
        setApiKeys(subscriptionKeys);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.createSubscriberApiKey({
        subscriptionId,
        consumerAddress,
        name: formData.name || undefined,
        description: formData.description || undefined,
        expiresAt: formData.expiresAt || undefined,
      });

      if (response && 'success' in response && response.success && 'data' in response) {
        setNewKey(response.data.key);
        setShowCreateForm(false);
        setFormData({ name: '', description: '', expiresAt: '' });
        loadApiKeys();
        onKeyCreated?.();
      }
    } catch (error: any) {
      console.error('Error creating API key:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;

    try {
      const response = await apiClient.revokeApiKey(keyId);
      if (response.success) {
        loadApiKeys();
      }
    } catch (error: any) {
      console.error('Error revoking API key:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Load keys on mount
  useEffect(() => {
    if (consumerAddress && subscriptionId) {
      loadApiKeys();
    }
  }, [consumerAddress, subscriptionId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">API Keys</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-secondary text-sm"
        >
          {showCreateForm ? 'Cancel' : '+ New API Key'}
        </button>
      </div>

      {/* New Key Display (shown once) */}
      {newKey && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-green-800">✅ API Key Created!</h4>
            <button
              onClick={() => setNewKey(null)}
              className="text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-green-700 mb-2">
            ⚠️ Copy this key now - you won't be able to see it again!
          </p>
          <div className="bg-white p-3 rounded border border-green-300">
            <code className="text-sm font-mono break-all text-gray-900">{newKey}</code>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(newKey);
              alert('API key copied to clipboard!');
            }}
            className="btn-primary mt-2 text-sm"
          >
            Copy to Clipboard
          </button>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="card">
          <h4 className="font-bold mb-4">Create New API Key</h4>
          <form onSubmit={handleCreateKey} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Name (optional)</label>
              <input
                type="text"
                className="input text-sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., My App Integration"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Description (optional)</label>
              <textarea
                className="input text-sm"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this key for?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Expires At (optional)</label>
              <input
                type="date"
                className="input text-sm"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Key'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* API Keys List */}
      {apiKeys.length === 0 ? (
        <p className="text-sm text-gray-600">No API keys created yet.</p>
      ) : (
        <div className="space-y-2">
          {apiKeys.map((key) => (
            <div key={key.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-900">
                      {key.keyPrefix}...
                    </code>
                    {key.name && <span className="font-medium text-gray-900">{key.name}</span>}
                    {key.revokedAt && (
                      <span className="badge-premium bg-red-100 text-red-800">Revoked</span>
                    )}
                    {key.expiresAt && new Date(key.expiresAt) < new Date() && (
                      <span className="badge-premium bg-yellow-100 text-yellow-800">Expired</span>
                    )}
                  </div>
                  {key.description && (
                    <p className="text-xs text-gray-600 mb-1">{key.description}</p>
                  )}
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Created: {new Date(key.createdAt).toLocaleDateString()}</div>
                    {key.lastUsedAt && (
                      <div>Last used: {new Date(key.lastUsedAt).toLocaleDateString()}</div>
                    )}
                    <div>Usage: {key.usageCount} requests</div>
                  </div>
                </div>
                {!key.revokedAt && (
                  <button
                    onClick={() => handleRevoke(key.id)}
                    className="btn-secondary text-xs"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

