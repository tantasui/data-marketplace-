import { useCurrentAccount, useSignAndExecuteTransactionBlock, useSuiClient } from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useState, useCallback } from 'react';

export function useSuiWallet() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const address = account?.address;
  const isConnected = !!account;

  // Get SUI balance
  const getBalance = useCallback(async () => {
    if (!address) return 0;

    try {
      const balance = await client.getBalance({
        owner: address,
      });
      return parseInt(balance.totalBalance) / 1_000_000_000; // Convert MIST to SUI
    } catch (err: any) {
      console.error('Error getting balance:', err);
      return 0;
    }
  }, [address, client]);

  // Subscribe to a feed
  const subscribe = useCallback(async (
    feedId: string,
    registryId: string,
    treasuryId: string,
    tier: number,
    paymentAmount: number,
    packageId: string
  ) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = new TransactionBlock();

      // Split coin for payment (convert SUI to MIST)
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(paymentAmount * 1_000_000_000)]);

      tx.moveCall({
        target: `${packageId}::subscription::subscribe_to_feed`,
        arguments: [
          tx.object(feedId),
          tx.object(registryId),
          tx.object(treasuryId),
          coin,
          tx.pure.u8(tier),
        ],
      });

      const result = await signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      // Extract subscription ID
      const createdObjects = result.objectChanges?.filter(
        (change: any) => change.type === 'created'
      );

      if (createdObjects && createdObjects.length > 0) {
        const subscriptionObject = createdObjects.find((obj: any) =>
          obj.objectType?.includes('Subscription')
        );
        if (subscriptionObject && 'objectId' in subscriptionObject) {
          setIsLoading(false);
          return subscriptionObject.objectId;
        }
      }

      throw new Error('Failed to extract subscription ID');
    } catch (err: any) {
      console.error('Error subscribing:', err);
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  }, [address, signAndExecuteTransactionBlock]);

  // Register a data feed
  const registerFeed = useCallback(async (
    registryId: string,
    feedData: {
      name: string;
      category: string;
      description: string;
      location: string;
      pricePerQuery: number;
      monthlySubscriptionPrice: number;
      isPremium: boolean;
      walrusBlobId: string;
      updateFrequency: number;
    },
    packageId: string
  ) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = new TransactionBlock();

      tx.moveCall({
        target: `${packageId}::data_marketplace::register_data_feed`,
        arguments: [
          tx.object(registryId),
          tx.pure.string(feedData.name),
          tx.pure.string(feedData.category),
          tx.pure.string(feedData.description),
          tx.pure.string(feedData.location),
          tx.pure.u64(feedData.pricePerQuery),
          tx.pure.u64(feedData.monthlySubscriptionPrice),
          tx.pure.bool(feedData.isPremium),
          tx.pure.string(feedData.walrusBlobId),
          tx.pure.u64(feedData.updateFrequency),
        ],
      });

      const result = await signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      // Extract feed ID
      const createdObjects = result.objectChanges?.filter(
        (change: any) => change.type === 'created'
      );

      if (createdObjects && createdObjects.length > 0) {
        const feedObject = createdObjects.find((obj: any) =>
          obj.objectType?.includes('DataFeed')
        );
        if (feedObject && 'objectId' in feedObject) {
          setIsLoading(false);
          return feedObject.objectId;
        }
      }

      throw new Error('Failed to extract feed ID');
    } catch (err: any) {
      console.error('Error registering feed:', err);
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  }, [address, signAndExecuteTransactionBlock]);

  // Update feed data
  const updateFeedData = useCallback(async (
    feedId: string,
    newWalrusBlobId: string,
    packageId: string
  ) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = new TransactionBlock();

      tx.moveCall({
        target: `${packageId}::data_marketplace::update_feed_data`,
        arguments: [
          tx.object(feedId),
          tx.pure.string(newWalrusBlobId),
        ],
      });

      const result = await signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });

      setIsLoading(false);
      return result.effects?.status.status === 'success';
    } catch (err: any) {
      console.error('Error updating feed:', err);
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  }, [address, signAndExecuteTransactionBlock]);

  // Submit rating
  const submitRating = useCallback(async (
    feedId: string,
    stars: number,
    comment: string,
    packageId: string
  ) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = new TransactionBlock();

      tx.moveCall({
        target: `${packageId}::reputation::submit_rating`,
        arguments: [
          tx.pure.id(feedId),
          tx.pure.u8(stars),
          tx.pure.string(comment),
        ],
      });

      const result = await signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      setIsLoading(false);
      return result;
    } catch (err: any) {
      console.error('Error submitting rating:', err);
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  }, [address, signAndExecuteTransactionBlock]);

  return {
    address,
    isConnected,
    isLoading,
    error,
    getBalance,
    subscribe,
    registerFeed,
    updateFeedData,
    submitRating,
  };
}
