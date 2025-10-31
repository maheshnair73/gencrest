# Login Credentials

## Andhra Pradesh - Anantapur Territory

### MDO (Market Development Officer)
- **Username:** `mdo_ap`
- **Password:** `mdo_ap`
- **Name:** Gabannagaru Thimmappa
- **Territory:** Anantapur
- **Region:** Rayalaseema
- **Zone:** ANDHRA PRADESH
- **State:** Andhra Pradesh

### TSM (Territory Sales Manager)
- **Username:** `tsm_ap`
- **Password:** `tsm_ap`
- **Name:** Lakshmi Narayana
- **Territory:** Anantapur District
- **Region:** Rayalaseema
- **Zone:** ANDHRA PRADESH
- **State:** Andhra Pradesh

### RBH (Regional Business Head)
- **Username:** `rbh_ap`
- **Password:** `rbh_ap`
- **Name:** Ramesh Babu
- **Region:** Rayalaseema
- **Zone:** ANDHRA PRADESH
- **State:** Andhra Pradesh

### ZBH (Zonal Business Head)
- **Username:** `zbh_ap`
- **Password:** `zbh_ap`
- **Name:** Srinivas Rao
- **Zone:** ANDHRA PRADESH
- **State:** Andhra Pradesh

---

## North Zone (Delhi, Punjab, Haryana)

### MDO (Market Development Officer)
- **Username:** `mdo`
- **Password:** `mdo`
- **Name:** Rajesh Kumar
- **Territory:** North Delhi
- **State:** Delhi

### TSM (Territory Sales Manager)
- **Username:** `tsm`
- **Password:** `tsm`
- **Name:** Priya Sharma
- **Territory:** Delhi Territory
- **State:** Delhi

### RBH (Regional Business Head)
- **Username:** `rbh`
- **Password:** `rbh`
- **Name:** Amit Patel
- **Region:** Delhi NCR
- **State:** Delhi

---

## Other Roles

### RMM (Regional Marketing Manager)
- **Username:** `rmm`
- **Password:** `rmm`
- **Name:** Sunita Gupta

### ZBH (Zonal Business Head - North)
- **Username:** `zbh`
- **Password:** `zbh`
- **Name:** Vikram Singh
- **Zone:** North Zone

### MH (Marketing Head)
- **Username:** `mh`
- **Password:** `mh`
- **Name:** Asad Ahmed

### VP (Vice President - Sales & Marketing)
- **Username:** `vp`
- **Password:** `vp`
- **Name:** Navdeep Mehta

### MD (Managing Director)
- **Username:** `md`
- **Password:** `md`
- **Name:** Ravi Agarwal

### CHRO (Chief Human Resources Officer)
- **Username:** `chro`
- **Password:** `chro`
- **Name:** Meera Joshi

### CFO (Chief Financial Officer)
- **Username:** `cfo`
- **Password:** `cfo`
- **Name:** Ashok Bansal

### Admin
- **Username:** `admin`
- **Password:** `admin`
- **Name:** effyBiz Admin

---

## Data Coverage

### Andhra Pradesh Zone
- **10 Distributors** across Anantapur District
- Territories: Anantapur City, Guntakal, Tadipatri, Gooty, Dharmavaram, Kadiri, Hindupur, Penukonda, Kalyanadurgam, Rayadurg
- **4 MDO Activities** specific to Anantapur territory

### North Zone
- **3 Distributors** across Delhi, Punjab, Haryana
- Territories: Rohini (Delhi), Ludhiana (Punjab), Karnal (Haryana)
- **3 MDO Activities** for Delhi region

## Role-Based Filter Access

### MDO (Market Development Officer)
**Filters Available:**
- ✅ Search by name/code
- ✅ Status filter (Active/Inactive)
- ❌ No priority filter
- ❌ No geographic filters (already limited to their territory)

**Data Scope:** Only their assigned territory

### TSM (Territory Sales Manager)
**Filters Available:**
- ✅ Search by name/code
- ✅ Status filter
- ✅ Priority filter (High/Medium/Low)
- ✅ Territory filter

**Data Scope:** All data within their assigned territory/region

### RBH (Regional Business Head)
**Filters Available:**
- ✅ Search by name/code
- ✅ Status filter
- ✅ Priority filter
- ✅ Region filter
- ✅ Territory filter

**Data Scope:** All data within their assigned region

### RMM / ZBH (Regional Marketing Manager / Zonal Business Head)
**Filters Available:**
- ✅ Search by name/code
- ✅ Status filter
- ✅ Priority filter
- ✅ State filter
- ✅ Region filter
- ✅ Territory filter

**Data Scope:** RMM sees regional data, ZBH sees zone data

### MH / VP / MD / CFO / CHRO / Admin (Executive Leadership)
**Filters Available:**
- ✅ Search by name/code
- ✅ Status filter
- ✅ Priority filter
- ✅ Zone filter
- ✅ State filter
- ✅ Region filter
- ✅ Territory filter

**Data Scope:** Full access to all data across the organization

## Filter Features
- **Cascading Filters:** Zone → State → Region → Territory (filters cascade down)
- **Active Filter Tags:** See which filters are applied with easy removal
- **Clear All:** One-click to remove all filters
- **Results Count:** Shows how many records match current filters
- **Role Display:** Shows which role you're viewing as

## Notes
- All passwords match the username for easy testing
- Data is filtered based on user role and territory/region/zone/state
- MDO users will only see activities for their assigned territory
- TSM users will see all activities in their territory
- RBH users will see all data in their region
- ZBH users will see all data in their zone
- Filters are dynamically shown/hidden based on user role
- Geographic filters (Zone/State/Region/Territory) cascade and reset dependent filters
