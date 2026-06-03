# Instagram Integration Setup Guide

## Overview
This feature allows admins to automatically post property photos and captions to Instagram directly from the admin panel's edit property form.

## Features Implemented

### 1. **Post to Instagram Button**
- Located at the top of the edit property form
- Gradient purple-to-pink Instagram-style button
- Automatically generates caption from property details
- Supports single image and carousel posts (up to 10 images)
- Shows loading state while posting

### 2. **Auto-Generated Caption**
The system automatically creates an Instagram-optimized caption including:
- 🏡 Property title
- 💰 Price (fixed or range)
- 🛏️ Bedroom configurations
- 📐 Area in sq.ft
- 📍 Location (area and city)
- Property description
- ✨ Top 5 amenities (with count if more)
- 📞 Contact information
- Relevant hashtags

### 3. **API Endpoint**
- **Route**: `/api/social-media/post-instagram`
- **Method**: POST
- **Auth**: Admin only
- **Supports**: Single image and carousel posts

## Setup Instructions

### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Business" as app type
4. Fill in app details and create

### Step 2: Add Instagram Graph API
1. In your app dashboard, click "Add Product"
2. Find "Instagram" and click "Set Up"
3. This adds Instagram Graph API to your app

### Step 3: Connect Instagram Business Account
1. Go to App Settings → Basic
2. Add your Instagram Business Account
3. Make sure your Instagram account is:
   - Converted to Business Account
   - Connected to a Facebook Page

### Step 4: Generate Access Token
1. Go to Tools → Graph API Explorer
2. Select your app from dropdown
3. Select your Instagram Business Account
4. Add these permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`
5. Click "Generate Access Token"
6. Copy the token (this is short-lived)

### Step 5: Get Long-Lived Access Token
Run this in your browser or API tool:
```
https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN
```

Replace:
- `YOUR_APP_ID` - Your Facebook App ID
- `YOUR_APP_SECRET` - Your Facebook App Secret
- `SHORT_LIVED_TOKEN` - Token from Step 4

This returns a long-lived token (60 days).

### Step 6: Get Instagram Account ID
Run this request:
```
https://graph.facebook.com/v21.0/me/accounts?access_token=YOUR_LONG_LIVED_TOKEN
```

From the response, find your Facebook Page ID, then run:
```
https://graph.facebook.com/v21.0/PAGE_ID?fields=instagram_business_account&access_token=YOUR_LONG_LIVED_TOKEN
```

Copy the `instagram_business_account.id` value.

### Step 7: Add to Environment Variables
Add these to your `.env.local` file:

```env
# Instagram API Configuration
INSTAGRAM_ACCESS_TOKEN=your_long_lived_access_token_here
INSTAGRAM_ACCOUNT_ID=your_instagram_business_account_id_here
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

**Important Notes:**
- `INSTAGRAM_ACCESS_TOKEN` - Long-lived access token from Step 5
- `INSTAGRAM_ACCOUNT_ID` - Instagram Business Account ID from Step 6
- `NEXT_PUBLIC_BASE_URL` - Your production domain (images must be publicly accessible)

### Step 8: Restart Development Server
```bash
npm run dev
```

## Usage

1. Login to admin panel at `/admin/login`
2. Navigate to any property and click "Edit"
3. Ensure property has at least one image uploaded
4. Click "Post to Instagram" button at the top of the form
5. Wait for confirmation toast message
6. Check your Instagram account for the new post

## Important Requirements

### Image Requirements
- Images must be publicly accessible URLs
- Supported formats: JPG, PNG
- Recommended size: 1080x1080px (square) or 1080x1350px (portrait)
- Maximum 10 images per carousel post

### Caption Requirements
- Maximum 2,200 characters
- Hashtags are included automatically
- Emojis are supported

### Account Requirements
- Instagram account must be a Business Account
- Must be connected to a Facebook Page
- Page must have admin access

## Token Refresh

Long-lived tokens expire after 60 days. To refresh:

1. Before expiration, exchange the token:
```
https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=CURRENT_LONG_LIVED_TOKEN
```

2. Update `.env.local` with new token
3. Restart server

## Troubleshooting

### Error: "Instagram credentials not configured"
- Check that `INSTAGRAM_ACCESS_TOKEN` and `INSTAGRAM_ACCOUNT_ID` are in `.env.local`
- Restart development server after adding variables

### Error: "Failed to create media container"
- Verify images are publicly accessible
- Check image URLs are absolute (not relative)
- Ensure images meet Instagram's requirements

### Error: "Invalid access token"
- Token may have expired (60 days)
- Generate new long-lived token
- Update `.env.local`

### Error: "Failed to publish post"
- Check Instagram account permissions
- Verify account is Business Account
- Ensure Facebook Page is connected

## API Response Examples

### Success Response
```json
{
  "success": true,
  "data": {
    "postId": "17895695668004550",
    "message": "Successfully posted to Instagram!"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Failed to create media container"
}
```

## Files Modified

1. **API Route**: `src/app/api/social-media/post-instagram/route.ts`
   - Handles Instagram posting logic
   - Supports single and carousel posts
   - Admin authentication required

2. **Edit Property Page**: `src/app/admin/dashboard/edit-property/[id]/page.tsx`
   - Added "Post to Instagram" button
   - Auto-generates caption from property data
   - Shows loading state during posting

3. **Environment Variables**: `.env.local`
   - Added Instagram credentials configuration

## Security Notes

- Access tokens are stored server-side only
- API endpoint requires admin authentication
- Tokens should never be exposed to client-side code
- Use environment variables for sensitive data
- Consider implementing token refresh automation for production

## Future Enhancements

- Auto-refresh access tokens before expiration
- Schedule posts for later
- Post to multiple social media platforms
- Custom caption templates
- Image optimization before posting
- Analytics tracking for posted content
