# Keep-Alive Service Setup (Prevent Render Cold Starts)

## Problem
Render's free tier puts your server to sleep after 15 minutes of inactivity. This causes:
- First request to take 30-60 seconds
- Poor user experience
- Potential timeout errors

## Solution
Set up a free cron job to ping your API every 10 minutes, keeping it awake.

---

## Step 1: Add Health Check Endpoint (Backend)

Add this to your Express/Node.js server:

```typescript
// routes/health.ts or in your main app.ts
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

Test it:
```bash
curl https://your-api.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-12-24T10:30:00.000Z",
  "uptime": 1234.5
}
```

---

## Step 2: Choose a Free Cron Service

### Option A: Cron-Job.org (RECOMMENDED - Easiest)

1. Go to https://cron-job.org/en/
2. Click "Create Cron Job"
3. Sign up (free)
4. Create new job:
   - **URL**: `https://your-api.onrender.com/api/health`
   - **Schedule**: Every 10 minutes
   - **Email notifications**: Optional

That's it! Your server will be pinged every 10 minutes.

### Option B: GitHub Actions (Free Alternative)

Create `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Alive

on:
  schedule:
    - cron: '*/10 * * * *'  # Every 10 minutes
  workflow_dispatch:

jobs:
  keep-alive:
    runs-on: ubuntu-latest
    steps:
      - name: Ping API
        run: |
          curl -f https://your-api.onrender.com/api/health \
            -H "User-Agent: KeepAlive" \
            || exit 1
```

Push to GitHub, and it will run automatically every 10 minutes.

### Option C: Uptime Robot (Free)

1. Go to https://uptimerobot.com
2. Sign up (free tier)
3. Add Monitor:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://your-api.onrender.com/api/health`
   - **Monitoring Interval**: 5 minutes
   - **Enable alerts**: Yes

---

## Step 3: Verify It's Working

After 1 hour, check your Render logs:
- Dashboard > Services > Your API > Logs
- You should see GET `/api/health` requests every 10 minutes

---

## Cost Comparison

| Solution | Cost | Effort | Reliability |
|----------|------|--------|------------|
| Cron-Job.org | Free | 2 mins | 99.9% |
| GitHub Actions | Free | 5 mins | 99.9% |
| Uptime Robot | Free | 5 mins | 99.9% |
| Render Starter Plan | $7/month | 0 mins | 100% |

---

## Recommendation

### If you're just starting:
✅ Use **Cron-Job.org** - Simplest setup, just 2 minutes

### If you want reliability:
✅ Use **GitHub Actions** + **Cron-Job.org** - Redundancy for free

### When you grow:
✅ Upgrade to **Render Starter ($7/month)** - Always-on, no keep-alive needed

---

## Additional Frontend Optimizations

While the keep-alive prevents cold starts, also implement these frontend improvements:

1. **Add loading indicators**
   ```tsx
   const [loading, setLoading] = useState(true);
   
   if (loading) return <LoadingSpinner />;
   ```

2. **Show user-friendly timeouts**
   ```tsx
   toast.error("Server is waking up, please wait...");
   ```

3. **Retry failed requests** (see `lib/fetchWithRetry.ts`)

---

## Monitoring

### Check Your Server's Wake Status:

```bash
# Should be instant if server is awake
curl -w "@curl-format.txt" -o /dev/null -s https://your-api.onrender.com/api/health

# If it takes >5 seconds, your server was sleeping
```

---

## Final Setup Checklist

- [ ] Added `/api/health` endpoint to backend
- [ ] Tested health endpoint in browser
- [ ] Set up Cron-Job.org (or alternative)
- [ ] Verified cron job is running (check logs after 10 mins)
- [ ] Implemented retry logic in frontend (`fetchWithRetry.ts`)
- [ ] Tested API responses after server "wakes up"
- [ ] Monitored Render logs for cron requests

---

## Need Help?

If you're still experiencing cold starts:
1. Check Render logs for activity
2. Verify cron job is actually pinging (should see logs every 10 mins)
3. Consider upgrading to Starter plan ($7/month) for guaranteed always-on service
