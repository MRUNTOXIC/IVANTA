# Property Limits Implementation

## Overview
Implemented property posting limits for User and Broker roles to control the number of active properties they can list.

## Property Limits by Role

| Role | Active Property Limit | Notes |
|------|----------------------|-------|
| User | 1 | Can post only 1 active property at a time |
| Broker | 10 | Can post up to 10 active properties |
| Builder | Unlimited | No limit on property postings |
| Admin | Unlimited | No limit on property postings |

## What Counts as "Active Property"

A property is considered **active** if:
- It is NOT marked as sold (`isSold: false`), OR
- It was sold within the last 10 days

Properties sold more than 10 days ago do NOT count toward the limit.

## Implementation Details

### 1. API Validation (`/api/user-properties`)
- Checks user role from cookies
- Counts active properties for the user
- Rejects submission if limit is reached
- Returns appropriate error message

### 2. Frontend Display (`/post-property`)
- Shows property limit banner at the top
- Displays: "X / Y active properties"
- Color-coded status:
  - **Blue**: Under 80% of limit
  - **Yellow**: 80% or more of limit
  - **Red**: Limit reached
- "Manage Properties" button when limit reached
- Submit button disabled when limit reached

### 3. Error Messages

**User (1 property limit):**
```
Property limit reached. Users can only post 1 active property. 
Please mark your existing property as sold before posting a new one.
```

**Broker (10 property limit):**
```
Property limit reached. Brokers can post up to 10 active properties. 
Please mark some properties as sold before posting new ones.
```

## User Flow

### For Users (1 Property Limit)

1. **First Property**
   - User posts property → Status: Pending
   - Banner shows: "1 / 1 active properties"
   - Submit button disabled

2. **To Post Another Property**
   - User must mark existing property as sold
   - After marking as sold, counter updates
   - Banner shows: "0 / 1 active properties"
   - Can now post new property

3. **After 10 Days**
   - Sold property automatically excluded from count
   - User can post new property without manual action

### For Brokers (10 Property Limit)

1. **Multiple Properties**
   - Broker can post up to 10 properties
   - Banner shows current count: "5 / 10 active properties"
   - Warning at 8+ properties (yellow banner)

2. **At Limit**
   - Banner shows: "10 / 10 active properties" (red)
   - Submit button disabled
   - Must mark properties as sold to post new ones

3. **Managing Properties**
   - Click "Manage Properties" button
   - Redirects to `/my-properties`
   - Can mark properties as sold

## Technical Implementation

### API Endpoint Changes

**File**: `src/app/api/user-properties/route.ts`

```javascript
// Count active properties
const activePropertiesCount = await Property.countDocuments({
  userEmail: body.userEmail,
  $or: [
    { isSold: { $ne: true } },
    { isSold: true, soldDate: { $gte: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) } }
  ]
});

// Check limits
if (userRole === 'User' && activePropertiesCount >= 1) {
  return error response
}

if (userRole === 'Broker' && activePropertiesCount >= 10) {
  return error response
}
```

### Frontend Changes

**File**: `src/app/post-property/page.tsx`

- Added `activePropertiesCount` state
- Added `propertyLimit` state
- Added `fetchActivePropertiesCount()` function
- Added property limit banner component
- Disabled submit button when limit reached

## Database Query

The active property count uses this MongoDB query:

```javascript
{
  userEmail: "user@example.com",
  $or: [
    { isSold: { $ne: true } },  // Not sold
    { 
      isSold: true, 
      soldDate: { $gte: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) } 
    }  // Sold within last 10 days
  ]
}
```

## Edge Cases Handled

1. **Property Sold Exactly 10 Days Ago**: Excluded from count
2. **Property Without soldDate**: If `isSold: true` but no `soldDate`, counted as active
3. **Pending Properties**: Count toward the limit
4. **Rejected Properties**: Count toward the limit
5. **Approved Properties**: Count toward the limit

## Benefits

1. **Prevents Spam**: Users can't flood the platform with listings
2. **Quality Control**: Encourages users to maintain current listings
3. **Fair Distribution**: Ensures platform isn't dominated by few users
4. **Automatic Cleanup**: Old sold properties don't block new listings
5. **Clear Feedback**: Users know exactly why they can't post

## Future Enhancements

- Add ability to upgrade User to Broker for more listings
- Add premium plans with higher limits
- Add analytics on property turnover rate
- Add notifications when properties can be removed from count
- Add bulk "mark as sold" feature for brokers

## Testing Checklist

- [ ] User can post 1 property
- [ ] User blocked from posting 2nd property
- [ ] User can post after marking property as sold
- [ ] Broker can post 10 properties
- [ ] Broker blocked from posting 11th property
- [ ] Property limit banner displays correctly
- [ ] Color coding works (blue/yellow/red)
- [ ] Submit button disables at limit
- [ ] "Manage Properties" button redirects correctly
- [ ] Error messages display correctly
- [ ] Properties sold 10+ days ago don't count
- [ ] Builder and Admin have no limits
