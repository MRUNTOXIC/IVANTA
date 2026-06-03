# Subdomain Setup Guide for IvantaProperty

## Overview
This feature allows you to create custom subdomains for individual properties. For example:
- `luxury-villa-rajkot.ivantaproperty.com`
- `premium-apartment.ivantaproperty.com`

## How It Works

### 1. Admin Panel Setup
1. Login to admin panel at `/admin/login`
2. Navigate to any property and click "Edit"
3. Scroll to the "Enable Custom Subdomain" section
4. Toggle the switch to enable subdomain
5. Enter a subdomain name (e.g., `luxury-villa-rajkot`)
6. Save the property

### 2. Subdomain Format
- Use lowercase letters, numbers, and hyphens only
- No spaces or special characters
- Example: `luxury-villa-ahmedabad`
- Full URL will be: `https://luxury-villa-ahmedabad.ivantaproperty.com`

## GoDaddy DNS Setup

### Step 1: Login to GoDaddy
1. Go to [GoDaddy.com](https://www.godaddy.com)
2. Click "Sign In" at the top right
3. Enter your credentials

### Step 2: Access DNS Management
1. Click on your profile icon (top right)
2. Select "My Products"
3. Find your domain `ivantaproperty.com`
4. Click the three dots (⋮) next to the domain
5. Select "Manage DNS"

### Step 3: Add Wildcard Subdomain Record

#### Option A: Wildcard CNAME (Recommended)
This allows ALL subdomains to work automatically without adding each one individually.

1. Click "Add" button in the DNS Records section
2. Select record type: **CNAME**
3. Fill in the details:
   - **Name**: `*` (asterisk - this is the wildcard)
   - **Value**: `ivantaproperty.com` (or your server IP/domain)
   - **TTL**: `1 Hour` (or default)
4. Click "Save"

**Example:**
```
Type: CNAME
Name: *
Value: ivantaproperty.com
TTL: 1 Hour
```

#### Option B: Individual Subdomain Records
If you prefer to add each subdomain individually:

1. Click "Add" button
2. Select record type: **CNAME** or **A Record**
3. For CNAME:
   - **Name**: `luxury-villa-rajkot` (your subdomain)
   - **Value**: `ivantaproperty.com`
   - **TTL**: `1 Hour`
4. For A Record:
   - **Name**: `luxury-villa-rajkot`
   - **Value**: `YOUR_SERVER_IP` (e.g., 123.45.67.89)
   - **TTL**: `1 Hour`
5. Click "Save"

### Step 4: Verify DNS Records
After adding records, your DNS table should look like this:

```
Type    Name                    Value                   TTL
--------------------------------------------------------------
A       @                       YOUR_SERVER_IP          1 Hour
CNAME   www                     ivantaproperty.com      1 Hour
CNAME   *                       ivantaproperty.com      1 Hour
```

### Step 5: Wait for DNS Propagation
- DNS changes can take 1-48 hours to propagate globally
- Usually takes 15-30 minutes for most users
- Check propagation status: [whatsmydns.net](https://www.whatsmydns.net)

## Server Configuration (Already Done)

The following configurations are already implemented in the codebase:

### 1. Middleware (src/middleware.ts)
- Detects subdomain from hostname
- Rewrites requests to `/property/subdomain/[subdomain]`
- Handles authentication for protected routes

### 2. Database Model (src/models/Property.ts)
- Added `subdomain` field with unique constraint
- Indexed for fast lookups

### 3. API Endpoint (src/app/api/properties/route.ts)
- Supports `?subdomain=` query parameter
- Returns property by subdomain

### 4. Dynamic Route (src/app/property/subdomain/[subdomain]/page.tsx)
- Fetches property by subdomain
- Redirects to actual property page

## Testing Subdomain

### Local Testing (Development)
Subdomains won't work on localhost. To test locally:

1. Edit your hosts file:
   - **Windows**: `C:\Windows\System32\drivers\etc\hosts`
   - **Mac/Linux**: `/etc/hosts`

2. Add this line:
   ```
   127.0.0.1 luxury-villa.localhost
   ```

3. Access: `http://luxury-villa.localhost:3000`

### Production Testing
1. Create a property with subdomain in admin panel
2. Wait 15-30 minutes for DNS propagation
3. Visit: `https://your-subdomain.ivantaproperty.com`
4. Should redirect to the property page

## Troubleshooting

### Issue: Subdomain not working
**Solutions:**
1. Check DNS propagation: [whatsmydns.net](https://www.whatsmydns.net)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try incognito/private mode
4. Wait longer (up to 48 hours)
5. Verify DNS records in GoDaddy

### Issue: "Property not found" error
**Solutions:**
1. Check if subdomain is saved in database
2. Verify subdomain spelling matches exactly
3. Check if property status is "approved"
4. Look at browser console for errors

### Issue: SSL certificate error
**Solutions:**
1. Wildcard SSL certificate needed for `*.ivantaproperty.com`
2. Contact hosting provider to install wildcard SSL
3. Or use Cloudflare for free SSL (see below)

## Cloudflare Setup (Optional - Recommended)

Cloudflare provides free SSL for wildcard subdomains:

### Step 1: Add Site to Cloudflare
1. Go to [Cloudflare.com](https://www.cloudflare.com)
2. Sign up / Login
3. Click "Add a Site"
4. Enter: `ivantaproperty.com`
5. Select Free plan
6. Click "Continue"

### Step 2: Update Nameservers in GoDaddy
1. Cloudflare will show you 2 nameservers (e.g., `ns1.cloudflare.com`)
2. Go back to GoDaddy
3. Navigate to Domain Settings
4. Find "Nameservers" section
5. Click "Change"
6. Select "Custom"
7. Enter Cloudflare nameservers
8. Save

### Step 3: Configure DNS in Cloudflare
1. In Cloudflare dashboard, go to "DNS"
2. Add records:
   ```
   Type: A
   Name: @
   Content: YOUR_SERVER_IP
   Proxy: ON (orange cloud)
   
   Type: A
   Name: *
   Content: YOUR_SERVER_IP
   Proxy: ON (orange cloud)
   ```

### Step 4: Enable SSL
1. Go to "SSL/TLS" in Cloudflare
2. Select "Full" or "Full (strict)"
3. Go to "Edge Certificates"
4. Enable "Always Use HTTPS"
5. Enable "Automatic HTTPS Rewrites"

## Benefits of Subdomain Feature

1. **SEO Friendly**: Each property gets its own unique URL
2. **Professional**: Looks more professional than `/property/123`
3. **Memorable**: Easy to remember and share
4. **Branding**: Can use property name in URL
5. **Marketing**: Better for social media and ads

## Examples of Good Subdomain Names

✅ **Good:**
- `luxury-villa-rajkot`
- `3bhk-apartment-nana-mava`
- `commercial-space-kalawad-road`
- `premium-plot-kotecha-chowk`

❌ **Bad:**
- `Luxury Villa Rajkot` (spaces not allowed)
- `3BHK@NanaMava` (special characters not allowed)
- `property123` (not descriptive)
- `abc` (too short, not meaningful)

## Security Considerations

1. **Unique Constraint**: Each subdomain can only be used once
2. **Validation**: Only lowercase letters, numbers, and hyphens allowed
3. **Admin Only**: Only admins can create/edit subdomains
4. **No Conflicts**: System prevents duplicate subdomains

## Future Enhancements

- [ ] Auto-generate subdomain from property title
- [ ] Subdomain availability checker
- [ ] Custom subdomain analytics
- [ ] Subdomain redirect history
- [ ] Bulk subdomain management

## Support

If you encounter any issues:
1. Check this guide first
2. Verify DNS settings in GoDaddy
3. Wait for DNS propagation (up to 48 hours)
4. Contact hosting provider for server issues
5. Check browser console for JavaScript errors

## Quick Reference

### DNS Record for Wildcard Subdomain
```
Type: CNAME
Name: *
Value: ivantaproperty.com
TTL: 1 Hour
```

### Check DNS Propagation
```
https://www.whatsmydns.net/#CNAME/*.ivantaproperty.com
```

### Test Subdomain
```
https://your-subdomain.ivantaproperty.com
```

---

**Last Updated**: January 2025
**Version**: 1.0
