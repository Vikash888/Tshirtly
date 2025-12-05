# Firebase Realtime Database Setup Instructions

## Current Issue
The orders are not being saved to Firebase RTDB. The connection is successful but writes are failing silently.

## Steps to Fix

### Option 1: Deploy Database Rules (Recommended for Production)
```bash
# Make sure you're logged into Firebase CLI
firebase login

# Deploy only the database rules
firebase deploy --only database
```

### Option 2: Temporary Public Rules (FOR TESTING ONLY)
If you want to test quickly, you can temporarily set public rules in Firebase Console:

1. Go to https://console.firebase.google.com/
2. Select your project: `studio-5802405481-68643`
3. Go to "Realtime Database" in the left menu
4. Click on the "Rules" tab
5. Replace the rules with this **TEMPORARY** configuration:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

6. Click "Publish"

⚠️ **WARNING**: This allows any authenticated user to write anywhere. Only use for testing!

### Option 3: Check Current Rules in Firebase Console
1. Go to Firebase Console > Realtime Database > Rules
2. Verify the rules match what's in `database.rules.json`
3. Check the "Simulator" tab to test if your auth user can write to `/orders/`

## Verify It Works
After deploying rules, try checking out again and you should see:
- ✅ Order saved successfully to RTDB!
- The order appearing in Firebase Console under "Data" > "orders"

## Current Database Rules
The rules in `database.rules.json` require:
- User must be authenticated
- Orders must have required fields
- Only the authenticated user can write their own orders
