# Mobile App Access Guide

## Quick Access Steps

### Step 1: Login First
Before accessing the mobile app, you need to be logged in.

1. Navigate to: `http://localhost:5173/` (or your deployed URL)
2. You'll see the login screen with user cards
3. Click on **any user card** to login (no password required in demo mode)
   - Example: Click on "Rajesh Kumar - MDO" card

### Step 2: Access Mobile App

**Option A: Using Sidebar (Recommended)**
1. After login, you'll see the dashboard with a sidebar on the left
2. Look for **"Mobile App"** in the sidebar navigation (📱 icon)
3. Click on it

**Option B: Direct URL**
1. After logging in, manually type: `http://localhost:5173/mobile`
2. Press Enter

**Option C: Browser Bookmark**
- Bookmark: `http://localhost:5173/mobile` for quick access

---

## Troubleshooting

### Issue: "Can't access the mobile app"

**Solution 1: Check if you're logged in**
```
1. Open browser console (F12)
2. Go to "Application" tab
3. Look for "Local Storage" → "authUser"
4. If empty, you need to login first
```

**Solution 2: Clear browser cache**
```
1. Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. Clear "Cached images and files"
3. Refresh the page
4. Login again
```

**Solution 3: Use incognito/private window**
```
1. Open new incognito window
2. Go to http://localhost:5173/
3. Login
4. Navigate to /mobile
```

**Solution 4: Check if dev server is running**
```bash
# In terminal, run:
npm run dev

# You should see:
# ➜  Local:   http://localhost:5173/
```

### Issue: "Mobile App" link not visible in sidebar

**Possible Causes:**
1. You're not logged in (login required)
2. Sidebar is collapsed (click menu icon to expand)
3. Browser zoom is too high (reset zoom to 100%)

**Solution:**
- Login first at `/`
- Look for the 📱 Smartphone icon in sidebar
- Or use direct URL: `/mobile`

### Issue: Page is blank or loading forever

**Solution:**
```
1. Check browser console for errors (F12)
2. Clear localStorage: localStorage.clear()
3. Refresh and login again
4. Try different browser
```

### Issue: "Layout component is blocking mobile view"

The mobile app route is currently inside the Layout wrapper. This means:
- ✅ You see the desktop sidebar on the left
- ✅ Mobile app interface on the right/center
- ✅ This is intentional for easy role switching

**To test pure mobile experience:**
1. Open browser DevTools (F12)
2. Click the device toolbar icon (or Ctrl+Shift+M)
3. Select a mobile device (iPhone, Android, etc.)
4. Refresh the page

---

## Testing Different Roles

### Quick Test: MDO Role
```
1. Login as: mdo@gencrest.com (or click "Rajesh Kumar" card)
2. Navigate to: /mobile
3. You should see: [Home] [Orders] [Liquidation] [Tasks] [Reports]
4. Notice: NO Team tab (MDOs don't manage teams)
```

### Quick Test: TSM Role
```
1. Logout (click "Switch User" button in mobile header)
2. Login as: tsm@gencrest.com (or click "Priya Sharma" card)
3. Navigate to: /mobile
4. You should see: [Home] [Team] [Orders] [Liquidation] [Tasks] [Reports]
5. Notice: Team tab IS present (TSMs manage MDOs)
```

### Quick Test: Manager Roles
```
1. Login as any of: RMM, ZBH, RBH, MH, VP, MD
2. Navigate to: /mobile
3. All have: [Home] [Team] [Orders] [Liquidation] [Tasks] [Reports]
```

---

## URLs Reference

| Page | URL | Auth Required |
|------|-----|---------------|
| Login | `http://localhost:5173/` | ❌ No |
| Dashboard | `http://localhost:5173/` | ✅ Yes |
| Mobile App | `http://localhost:5173/mobile` | ✅ Yes |
| Mobile Design | `http://localhost:5173/mobile-design` | ✅ Yes (MD/VP/MH only) |

---

## Demo Credentials

All users can login by clicking their card, or using:

| Role | Email | Click Card |
|------|-------|------------|
| MDO | mdo@gencrest.com | "Rajesh Kumar" |
| TSM | tsm@gencrest.com | "Priya Sharma" |
| RBH | rbh@gencrest.com | "Amit Patel" |
| RMM | rmm@gencrest.com | "Sunita Gupta" |
| ZBH | zbh@gencrest.com | "Vikram Singh" |
| MH | mh@gencrest.com | "Asad Ahmed" |
| VP | vp@gencrest.com | "Navdeep Mehta" |
| MD | md@gencrest.com | "Ravi Agarwal" |
| CHRO | chro@gencrest.com | "Meera Joshi" |
| CFO | cfo@gencrest.com | "Ashok Bansal" |

**Note:** In demo mode, no password is required. Just click the user card!

---

## Browser DevTools for Mobile Testing

### Chrome DevTools:
```
1. Press F12 (or Cmd+Option+I on Mac)
2. Click device toolbar icon (top-left, looks like phone/tablet)
3. Select device: "iPhone 12 Pro" or "Pixel 5"
4. Refresh page
```

### Firefox Responsive Design Mode:
```
1. Press Ctrl+Shift+M (or Cmd+Option+M on Mac)
2. Select device from dropdown
3. Refresh page
```

### Safari Responsive Design Mode:
```
1. Enable: Safari → Preferences → Advanced → Show Develop menu
2. Develop → Enter Responsive Design Mode
3. Select device
4. Refresh page
```

---

## Features to Test in Mobile App

### MDO Features (No Team Tab)
- ✅ Live meetings with countdown timer
- ✅ Work plan assignment view
- ✅ Batch stock update modal
- ✅ Stock verification with proof upload
- ✅ Geofencing validation
- ✅ 360° distributor view
- ✅ E-signature capture
- ✅ Photo proof upload

### TSM+ Features (With Team Tab)
- ✅ All MDO features PLUS
- ✅ Team tab with member list
- ✅ Team member cards
- ✅ Work plan approvals
- ✅ Territory dashboard

---

## Common Navigation Paths

```
Login Flow:
/ → Login Screen → Click User Card → Dashboard → Sidebar → Mobile App

Direct Access:
/ → Login → Type: /mobile in URL bar → Enter

Role Switch:
/mobile → Tap "Switch Role" button → Select different user → /mobile
```

---

## Still Having Issues?

1. **Check Terminal**: Make sure `npm run dev` is running
2. **Check Console**: Open F12 and look for error messages
3. **Check Network**: Go to Network tab, refresh, see if requests are failing
4. **Try Different Browser**: Test in Chrome, Firefox, or Safari
5. **Clear Everything**:
   ```javascript
   // In browser console:
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

---

## Success Indicators

You've successfully accessed the mobile app when you see:

✅ Purple gradient header with user initials
✅ "Switch Role" button (top-right)
✅ User name and role displayed
✅ Work plan assignment card
✅ Bottom navigation tabs (5-6 tabs)
✅ Mobile-optimized interface in center

---

**Need More Help?**
- Check: `HOW_TO_SWITCH_ROLES.md` for role switching guide
- Check: `MOBILE_APP_ROLES_GUIDE.md` for role-specific features
- Check: `docs/MOBILE_APP_DEVELOPER_GUIDE.md` for technical details
