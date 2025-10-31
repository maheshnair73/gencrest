# How to Switch Roles in Mobile App

## Quick Guide

### Method 1: Using the Mobile App Header (Easiest)

1. **Access the Mobile App**
   - Navigate to: `http://localhost:5173/mobile` (or your deployed URL + `/mobile`)

2. **Switch Role Button**
   - Look at the **top-right** of the mobile header
   - You'll see a **"Switch Role"** button in the purple gradient header
   - Tap on it

3. **Confirm Switch**
   - A confirmation dialog will appear
   - Tap "OK" to return to the login screen
   - Select a different user/role from the login page

4. **Alternative: Tap Profile Avatar**
   - You can also tap the **profile circle** (with initials) in the top-left
   - This will also prompt you to switch roles

---

### Method 2: Using the Login Page

1. **Go to Login**
   - Navigate to: `http://localhost:5173/`
   - Or refresh the page if already logged in

2. **Select a Role**
   - The login page shows multiple user cards
   - Each card represents a different role

3. **Available Roles to Test:**

   **Field Staff:**
   - 👤 **MDO** (Market Development Officer)
     - Email: `mdo@gencrest.com`
     - Access: Home, Orders, Liquidation, Tasks, Reports
     - Features: Stock updates, batch updates, verification

   **Team Managers:**
   - 👨‍💼 **TSM** (Territory Sales Manager)
     - Email: `tsm@gencrest.com`
     - Access: All MDO features + Team management
     - Features: Approve work plans, manage team

   **Regional Managers:**
   - 📊 **RMM** (Regional Marketing Manager)
     - Email: `rmm@gencrest.com`
     - Access: Multi-territory oversight
     - Features: Regional dashboards, approvals

   - 🏢 **ZBH** (Zonal Business Head)
     - Email: `zbh@gencrest.com`
     - Access: Zone-wide data
     - Features: Zone analytics, strategic planning

   - 🎯 **RBH** (Regional Business Head)
     - Email: `rbh@gencrest.com`
     - Access: Regional oversight
     - Features: Regional performance

   **Senior Management:**
   - ⭐ **MH** (Marketing Head)
     - Email: `mh@gencrest.com`
     - Access: Marketing analytics

   - 🔝 **VP** (Vice President Sales & Marketing)
     - Email: `vp@gencrest.com`
     - Access: Executive dashboards

   **C-Suite:**
   - 👔 **CHRO** (Chief HR Officer)
     - Email: `chro@gencrest.com`
     - Access: HR analytics

   - 💰 **CFO** (Chief Financial Officer)
     - Email: `cfo@gencrest.com`
     - Access: Financial reports

   - 👑 **MD** (Managing Director)
     - Email: `md@gencrest.com`
     - Access: All business metrics

4. **Login**
   - Click on any user card to login as that role
   - No password required (demo mode)

---

## What Changes Based on Role?

### 🔹 MDO View
```
Header: Profile + Switch Role Button
Tabs:  [Home] [Orders] [Liquidation] [Tasks] [Reports]

Features:
✅ Live meetings countdown
✅ Work plan assignments
✅ Batch stock update
✅ Stock verification with proof
✅ Geofencing validation
✅ 360° distributor view
❌ No Team tab
❌ No approval workflows
```

### 🔹 TSM View
```
Header: Profile + Switch Role Button
Tabs:  [Home] [Team] [Orders] [Liquidation] [Tasks] [Reports]

Features:
✅ All MDO features
✅ Team tab (NEW!)
✅ Team member management
✅ Work plan creation
✅ Approval workflows
✅ Territory dashboard
```

### 🔹 Manager View (RMM, ZBH, RBH, MH, VP)
```
Header: Profile + Switch Role Button
Tabs:  [Home] [Team] [Orders] [Liquidation] [Tasks] [Reports]

Features:
✅ Multi-territory view
✅ Team hierarchy
✅ Regional/Zone analytics
✅ Strategic dashboards
✅ Approval queues
✅ Comparative reports
```

### 🔹 Executive View (CHRO, CFO, MD)
```
Header: Profile + Switch Role Button
Tabs:  [Home] [Team] [Reports]

Features:
✅ High-level KPIs
✅ Organization-wide metrics
✅ Executive summaries
✅ Strategic analytics
❌ Limited field operations
```

---

## Testing Different Roles

### Test Scenario 1: Field Staff Workflow (MDO)

1. Login as **MDO**
2. Go to Mobile App (`/mobile`)
3. Check **Home** tab:
   - See live meetings with countdown
   - View work plan assignment
4. Go to **Liquidation** tab:
   - Search for a distributor
   - Tap on a distributor card
   - Try **Verify Stock** button
   - Upload proof (photo/e-signature)
   - Test geofencing validation
5. Try **Batch Stock Update**:
   - Tap "Batch Update" button
   - Update multiple SKUs
   - Allocate between Farmers/Retailers
   - Review and submit

### Test Scenario 2: Manager Workflow (TSM)

1. Switch to **TSM** role
2. Notice new **Team** tab appears
3. Check **Team** tab:
   - View all MDO team members
   - See their status and performance
4. Go to **Liquidation**:
   - See territory-wide data
   - Access approval workflows
5. Check **Home**:
   - Territory dashboard
   - Pending approvals

### Test Scenario 3: Executive View (MD)

1. Switch to **MD** role
2. Notice simplified interface
3. Check **Home**:
   - Strategic KPIs
   - Organization-wide metrics
4. Check **Reports**:
   - Executive summaries
   - Business performance
5. Notice field operation tabs are hidden

---

## Quick Switch Guide

### Desktop to Mobile
```
Desktop App: http://localhost:5173/
Mobile App:  http://localhost:5173/mobile

Switch: Click "Mobile App" link in sidebar (if available)
Or: Manually type /mobile in URL
```

### Role Switching Shortcuts
```
1. Tap "Switch Role" button (top-right of mobile header)
2. Or tap profile avatar (top-left)
3. Or navigate to / (root URL)
4. Select different user card
```

---

## Role Comparison Matrix

| Feature | MDO | TSM | RMM | ZBH+ | Executives |
|---------|-----|-----|-----|------|------------|
| Home Tab | ✅ | ✅ | ✅ | ✅ | ✅ |
| Team Tab | ❌ | ✅ | ✅ | ✅ | ✅ |
| Orders | ✅ | ✅ | ✅ | ✅ | ❌ |
| Liquidation | ✅ | ✅ | ✅ | ✅ | ❌ |
| Tasks | ✅ | ✅ | ✅ | ✅ | ❌ |
| Reports | ✅ | ✅ | ✅ | ✅ | ✅ |
| Stock Updates | ✅ | ✅ | ❌ | ❌ | ❌ |
| Batch Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Approvals | ❌ | ✅ | ✅ | ✅ | ✅ |
| Team Mgmt | ❌ | ✅ | ✅ | ✅ | ✅ |
| Work Plans | View | Create | Approve | Approve | View |
| Geofencing | ✅ | ✅ | ❌ | ❌ | ❌ |
| 360° View | ✅ | ✅ | ✅ | ✅ | ❌ |

---

## Troubleshooting

### Issue: Can't see "Switch Role" button
**Solution:**
- Make sure you're on `/mobile` page
- Look in the top-right of the purple header
- Try tapping the profile avatar instead

### Issue: Want to test without switching
**Solution:**
- Open multiple browser tabs/windows
- Login as different roles in each tab
- Compare side-by-side

### Issue: Role not changing after switch
**Solution:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Re-login

### Issue: Some features not visible
**Solution:**
- Check if that feature is available for your role
- Refer to the Role Comparison Matrix above
- MDO has different access than TSM/Managers

---

## Pro Tips

1. **Test Complete Workflows**
   - Login as MDO → Update stock → Switch to TSM → Approve update

2. **Compare Views**
   - Open 2 tabs: MDO and TSM side-by-side
   - See how data looks different for each role

3. **Test Geofencing**
   - Login as MDO
   - Try stock update (will check your location)
   - See validation messages

4. **Test Batch Updates**
   - Login as MDO or TSM
   - Go to Liquidation tab
   - Tap "Batch Update" button
   - Update multiple SKUs at once

5. **Test Mobile Responsiveness**
   - Resize browser window
   - Use mobile device or mobile emulator
   - Test touch interactions

---

## URLs Summary

```
Login Page:           http://localhost:5173/
Desktop Dashboard:    http://localhost:5173/dashboard
Mobile App:          http://localhost:5173/mobile
Mobile Design Doc:   http://localhost:5173/mobile-design
```

---

## Need Help?

- Check: `MOBILE_APP_ROLES_GUIDE.md` for detailed role documentation
- Check: `LOGIN_CREDENTIALS.md` for all available test users
- Check: `MOBILE_APP_DEVELOPER_GUIDE.md` for technical details

**Happy Testing! 🎉**
