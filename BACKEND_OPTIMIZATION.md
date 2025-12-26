# Backend Optimization Guide for Render Free Tier

## 🔴 Current Issues

### 1. **Cold Starts (30-60 seconds)**
- Free tier sleeps after 15 mins of inactivity
- First request takes forever
- User timeout errors

### 2. **Limited Resources**
- No persistent connections
- Memory constraints
- CPU throttling

### 3. **Database Queries**
- N+1 query problems
- Missing indexes
- No pagination

---

## ✅ Recommended Backend Optimizations

### 1. Add Health Check Endpoint (5 mins)

```typescript
// routes/health.ts
export const healthRouter = express.Router();

healthRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// app.ts
app.use('/api', healthRouter);
```

### 2. Add Response Compression (10 mins)

```typescript
// app.ts
import compression from 'compression';

app.use(compression());

// Reduce response sizes by 70%
// Install: npm i compression
```

### 3. Implement Database Indexes (15 mins)

```typescript
// config/database.ts
// MongoDB
db.collection('bundles').createIndex({ telcoCode: 1, isActive: 1 });
db.collection('bundles').createIndex({ createdAt: -1 });

db.collection('orders').createIndex({ userId: 1, createdAt: -1 });
db.collection('orders').createIndex({ status: 1 });
db.collection('orders').createIndex({ paymentStatus: 1 });

db.collection('users').createIndex({ email: 1 }, { unique: true });

// PostgreSQL
CREATE INDEX idx_bundles_telco ON bundles(telco_code, is_active);
CREATE INDEX idx_bundles_created ON bundles(created_at DESC);
CREATE INDEX idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_users_email ON users(email UNIQUE);
```

### 4. Implement Pagination Everywhere (20 mins)

```typescript
// routes/bundles.ts
export async function getBundles(req, res) {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const skip = (page - 1) * limit;

  const bundles = await Bundle.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Bundle.countDocuments();

  res.json({
    success: true,
    data: {
      bundles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}

// routes/orders.ts
export async function getOrders(req, res) {
  const userId = req.user._id;
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ userId })
    .skip(skip)
    .limit(limit)
    .populate('bundle')
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments({ userId });

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}
```

### 5. Implement Response Caching (25 mins)

```typescript
// middleware/cache.ts
import Redis from 'redis';

const redis = Redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

export function cacheMiddleware(
  durationSeconds: number = 300
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') return next();

    const key = `cache:${req.originalUrl}`;

    redis.get(key, (err, data) => {
      if (data) {
        return res.json(JSON.parse(data));
      }
      next();
    });
  };
}

// routes/bundles.ts
app.get(
  '/api/bundles',
  cacheMiddleware(600), // Cache for 10 minutes
  getBundles
);

// After sending response:
redis.setex(
  `cache:${req.originalUrl}`,
  600,
  JSON.stringify(responseData)
);
```

**Note**: Redis is free on Render with a database add-on, or use in-memory cache:

```typescript
// Simple in-memory cache (no Redis needed)
class SimpleCache {
  private cache = new Map();
  private ttls = new Map();

  set(key: string, value: any, ttlSeconds: number) {
    this.cache.set(key, value);
    
    if (this.ttls.has(key)) {
      clearTimeout(this.ttls.get(key));
    }

    this.ttls.set(
      key,
      setTimeout(() => this.cache.delete(key), ttlSeconds * 1000)
    );
  }

  get(key: string) {
    return this.cache.get(key);
  }
}
```

### 6. Optimize Database Queries (30 mins)

```typescript
// ❌ BAD: N+1 Query Problem
const orders = await Order.find().limit(10);
for (const order of orders) {
  order.bundle = await Bundle.findById(order.bundleId); // 10 extra queries!
}

// ✅ GOOD: Use populate
const orders = await Order.find()
  .limit(10)
  .populate('bundle');

// ❌ BAD: Returning all fields
const users = await User.find();

// ✅ GOOD: Select only needed fields
const users = await User.find().select('email name phone');

// ❌ BAD: No limit on results
const bundles = await Bundle.find().sort({ createdAt: -1 });

// ✅ GOOD: Always paginate
const bundles = await Bundle.find()
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);
```

### 7. Use Connection Pooling (10 mins)

```typescript
// config/database.ts
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
});

// or for Mongoose
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 5,
});
```

### 8. Add Error Handling & Logging (20 mins)

```typescript
// middleware/errorHandler.ts
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

// Routes
app.use(errorHandler);
```

### 9. Rate Limiting (15 mins)

```typescript
// middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
});

app.use('/api/', limiter);

// Stricter for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

app.post('/api/auth/login', authLimiter, loginHandler);
```

### 10. Monitor & Alert (Ongoing)

```typescript
// Setup monitoring
// Option 1: Render's built-in monitoring
// Dashboard > Services > Logs & Metrics

// Option 2: Free services
// - LogRocket (frontend)
// - Sentry (errors)
// - New Relic (free tier)

// Add to your code:
import Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});

app.use(Sentry.Handlers.errorHandler());
```

---

## 📊 Implementation Priority

### CRITICAL (Do First)
1. ✅ Add health endpoint (5 mins)
2. ✅ Add compression (10 mins)
3. ✅ Add database indexes (15 mins)

### IMPORTANT (Do This Week)
1. ✅ Implement pagination (20 mins)
2. ✅ Optimize queries (30 mins)
3. ✅ Add simple caching (20 mins)

### NICE TO HAVE (Next Week)
1. ✅ Rate limiting (15 mins)
2. ✅ Error handling/logging (20 mins)
3. ✅ Connection pooling (10 mins)

---

## 🚀 Expected Performance Improvements

| Optimization | Performance Gain | Effort |
|--------------|-----------------|--------|
| Compression | 30% faster responses | Easy |
| Database indexes | 10x faster queries | Easy |
| Pagination | 90% less data transferred | Easy |
| Caching | 99% hit rate (instant) | Medium |
| Query optimization | 5x faster queries | Medium |

---

## 💡 Total Backend Optimization Time

- **Quick wins (Compression + Indexes + Pagination)**: 45 minutes
- **Full optimization**: 3-4 hours
- **Performance improvement**: 500-1000% faster ⚡

---

## 🎯 For Render Deployment

### Before Deploying, Add:

```bash
# .env.render
NODE_ENV=production
COMPRESSION_ENABLED=true
CACHE_ENABLED=true
LOG_LEVEL=error
```

### Monitor After Deployment:

1. Go to Render Dashboard
2. Select your service
3. Check "Logs" for errors
4. Check "Metrics" for:
   - CPU usage
   - Memory usage
   - Request latency
   - Error rate

---

## ⚡ Final Recommendation

### Minimum (Today)
- [ ] Add /api/health
- [ ] Add compression
- [ ] Add database indexes

### Recommended (This Week)
- [ ] Pagination on all endpoints
- [ ] Query optimization
- [ ] In-memory caching

### Ideal (Before Growth)
- [ ] Rate limiting
- [ ] Error tracking (Sentry)
- [ ] Upgrade to Render Starter ($7/month)

These changes will make your app **5-10x faster** with minimal effort!
