# Prisma Accelerate Setup

## ✅ What's Been Configured

1. **Accelerate Extension Installed**: `@prisma/extension-accelerate` added
2. **Prisma Service Updated**: Now supports both Accelerate and direct connections
3. **Generate Command Updated**: Uses `--no-engine` flag for Accelerate

## 🔧 Configuration

### Option 1: Use Prisma Accelerate (Recommended for Production)

Add to your `.env`:
```bash
# Your direct database URL (for migrations)
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Prisma Accelerate connection string (get from Prisma Cloud)
PRISMA_ACCELERATE_URL="prisma://accelerate.prisma-data.net/?api_key=xxx"
```

### Option 2: Use Direct Connection (Development)

Just use:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

The service will automatically detect if `PRISMA_ACCELERATE_URL` is set and use Accelerate, otherwise it falls back to direct connection.

## 🚀 Setup Steps

### 1. Get Prisma Accelerate URL (Optional)

If you want to use Accelerate:
1. Sign up at https://www.prisma.io/accelerate
2. Create a project
3. Copy your Accelerate connection string
4. Add to `.env` as `PRISMA_ACCELERATE_URL`

### 2. Generate Prisma Client

```bash
cd backend
npm run prisma:generate
```

This uses `--no-engine` flag which is required for Accelerate.

### 3. Create Migrations

```bash
npm run prisma:migrate
```

### 4. Use Caching (Optional)

When using Accelerate, you can add caching to queries:

```typescript
import prisma from './services/prisma.service';

// Query with 60 second cache
const users = await prisma.apiKey.findMany({
  where: { type: 'PROVIDER' },
  cacheStrategy: { ttl: 60 }, // Cache for 60 seconds
});
```

## 📊 Benefits of Accelerate

- **Connection Pooling**: Better performance under load
- **Caching**: Reduce database queries
- **Edge Support**: Works in serverless/edge environments
- **Monitoring**: Built-in insights and analytics

## 🔍 How It Works

The Prisma service automatically:
1. Checks for `PRISMA_ACCELERATE_URL` environment variable
2. Uses Accelerate if configured, otherwise direct connection
3. Logs which mode is active in development

## 📝 Example Usage

```typescript
import prisma from './services/prisma.service';

// Regular query (works with both Accelerate and direct)
const apiKey = await prisma.apiKey.findUnique({
  where: { keyHash: hashedKey },
});

// Query with caching (only works with Accelerate)
const usageLogs = await prisma.usageLog.findMany({
  where: { feedId },
  cacheStrategy: { ttl: 30 }, // Cache for 30 seconds
});
```

## ⚠️ Important Notes

- **Migrations**: Always use `DATABASE_URL` (direct connection) for migrations
- **Queries**: Can use either `DATABASE_URL` or `PRISMA_ACCELERATE_URL`
- **Caching**: Only available when using Accelerate
- **Development**: Direct connection is fine for local development

## 🎯 Next Steps

1. Set up Prisma Accelerate account (optional)
2. Add `PRISMA_ACCELERATE_URL` to `.env` if using Accelerate
3. Run `npm run prisma:generate`
4. Run `npm run prisma:migrate`
5. Start building API key service!

