# GoDaddy DNS Configuration - Step by Step

## 🎯 Goal
Configure wildcard subdomain for `*.ivantaproperty.com` to enable custom property subdomains.

---

## 📋 Prerequisites
- GoDaddy account with access to `ivantaproperty.com`
- Admin access to the domain

---

## 🔧 Step-by-Step Instructions

### Step 1: Login to GoDaddy
```
1. Open browser and go to: https://www.godaddy.com
2. Click "Sign In" button (top right corner)
3. Enter your email and password
4. Click "Sign In"
```

---

### Step 2: Navigate to Domain Management
```
1. After login, click on your profile icon (top right)
2. From dropdown menu, select "My Products"
3. You'll see a list of your domains and products
```

---

### Step 3: Access DNS Settings
```
1. Find "ivantaproperty.com" in the domains list
2. Click the three dots (⋮) or "DNS" button next to it
3. Select "Manage DNS" from the menu
4. You'll be taken to the DNS Management page
```

---

### Step 4: Add Wildcard CNAME Record
```
1. On DNS Management page, scroll to "DNS Records" section
2. Click the "Add" button (usually blue button)
3. A form will appear with these fields:

   Field 1 - Type:
   └─ Select "CNAME" from dropdown
   
   Field 2 - Name:
   └─ Enter: *
      (Just an asterisk, nothing else)
   
   Field 3 - Value:
   └─ Enter: ivantaproperty.com
      (Your main domain)
   
   Field 4 - TTL:
   └─ Select: 1 Hour
      (Or leave as default)

4. Click "Save" button
```

---

### Step 5: Verify the Record
```
After saving, you should see a new record in your DNS table:

┌──────────┬──────────┬─────────────────────┬─────────┐
│ Type     │ Name     │ Value               │ TTL     │
├──────────┼──────────┼─────────────────────┼─────────┤
│ CNAME    │ *        │ ivantaproperty.com  │ 1 Hour  │
└──────────┴──────────┴─────────────────────┴─────────┘

This means ALL subdomains will now point to your main domain.
```

---

## 🎨 Visual Representation

```
Before DNS Setup:
luxury-villa.ivantaproperty.com ❌ → Not Found

After DNS Setup:
luxury-villa.ivantaproperty.com ✅ → ivantaproperty.com → Your Server
premium-flat.ivantaproperty.com ✅ → ivantaproperty.com → Your Server
any-name.ivantaproperty.com     ✅ → ivantaproperty.com → Your Server
```

---

## ⏱️ DNS Propagation Timeline

```
Immediate:     0-5 minutes   → GoDaddy servers updated
Local ISP:     15-30 minutes → Your internet provider
Global:        1-4 hours     → Most users worldwide
Complete:      24-48 hours   → 100% global coverage
```

---

## 🧪 Testing DNS Propagation

### Method 1: Online Tool
```
1. Go to: https://www.whatsmydns.net
2. Enter: luxury-villa.ivantaproperty.com
3. Select: CNAME
4. Click "Search"
5. Check if it shows "ivantaproperty.com" in results
```

### Method 2: Command Line

**Windows (Command Prompt):**
```cmd
nslookup luxury-villa.ivantaproperty.com
```

**Mac/Linux (Terminal):**
```bash
dig luxury-villa.ivantaproperty.com
```

**Expected Output:**
```
luxury-villa.ivantaproperty.com → CNAME → ivantaproperty.com
```

---

## 📊 Complete DNS Configuration Example

Your final DNS table should look similar to this:

```
┌──────────┬──────────┬─────────────────────┬─────────┐
│ Type     │ Name     │ Value               │ TTL     │
├──────────┼──────────┼─────────────────────┼─────────┤
│ A        │ @        │ 123.45.67.89        │ 1 Hour  │ ← Main domain
│ CNAME    │ www      │ ivantaproperty.com  │ 1 Hour  │ ← www subdomain
│ CNAME    │ *        │ ivantaproperty.com  │ 1 Hour  │ ← Wildcard (NEW)
└──────────┴──────────┴─────────────────────┴─────────┘

Note: Replace 123.45.67.89 with your actual server IP
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ Wrong Name Field
```
Name: *.ivantaproperty.com  ← WRONG
Name: *                     ← CORRECT
```

### ❌ Wrong Value Field
```
Value: www.ivantaproperty.com  ← WRONG
Value: ivantaproperty.com      ← CORRECT
```

### ❌ Wrong Record Type
```
Type: A Record    ← WRONG (unless using IP)
Type: CNAME       ← CORRECT
```

---

## 🔄 Alternative: Individual Subdomains

If you don't want wildcard, add each subdomain individually:

```
For: luxury-villa.ivantaproperty.com
┌──────────┬──────────────────┬─────────────────────┬─────────┐
│ Type     │ Name             │ Value               │ TTL     │
├──────────┼──────────────────┼─────────────────────┼─────────┤
│ CNAME    │ luxury-villa     │ ivantaproperty.com  │ 1 Hour  │
└──────────┴──────────────────┴─────────────────────┴─────────┘

For: premium-flat.ivantaproperty.com
┌──────────┬──────────────────┬─────────────────────┬─────────┐
│ Type     │ Name             │ Value               │ TTL     │
├──────────┼──────────────────┼─────────────────────┼─────────┤
│ CNAME    │ premium-flat     │ ivantaproperty.com  │ 1 Hour  │
└──────────┴──────────────────┴─────────────────────┴─────────┘

Note: This requires adding a new record for EACH property subdomain
```

---

## 🎯 Quick Checklist

- [ ] Logged into GoDaddy
- [ ] Navigated to "My Products"
- [ ] Clicked "Manage DNS" for ivantaproperty.com
- [ ] Clicked "Add" button
- [ ] Selected "CNAME" as Type
- [ ] Entered "*" in Name field
- [ ] Entered "ivantaproperty.com" in Value field
- [ ] Set TTL to "1 Hour"
- [ ] Clicked "Save"
- [ ] Verified record appears in DNS table
- [ ] Waited 15-30 minutes for propagation
- [ ] Tested subdomain access

---

## 🆘 Troubleshooting

### Issue: Can't find "Manage DNS" option
**Solution:**
- Look for "DNS" button next to domain
- Or click three dots (⋮) → "Manage DNS"
- Or go to: https://dcc.godaddy.com/manage/ivantaproperty.com/dns

### Issue: "Add" button is disabled
**Solution:**
- Check if you have admin access to domain
- Try refreshing the page
- Clear browser cache
- Try different browser

### Issue: Record not saving
**Solution:**
- Check all fields are filled correctly
- Name should be just "*" (no quotes)
- Value should be "ivantaproperty.com" (no http://)
- Try again after a few minutes

### Issue: Subdomain still not working after 24 hours
**Solution:**
- Verify record is visible in DNS table
- Check DNS propagation: whatsmydns.net
- Contact GoDaddy support
- Check server configuration

---

## 📞 Support Contacts

**GoDaddy Support:**
- Phone: 1-480-505-8877
- Chat: Available in GoDaddy dashboard
- Help: https://www.godaddy.com/help

**DNS Propagation Checker:**
- https://www.whatsmydns.net
- https://dnschecker.org

---

## ✅ Success Indicators

You'll know it's working when:
1. ✅ Record appears in GoDaddy DNS table
2. ✅ whatsmydns.net shows CNAME record
3. ✅ Visiting subdomain doesn't show "not found"
4. ✅ Property page loads when accessing subdomain

---

**Last Updated**: January 2025
**Difficulty**: Easy (5-10 minutes)
**Cost**: Free (included with domain)
