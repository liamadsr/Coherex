# Claude Development Rules for Coherex

## 🎯 Core Principle: Mock-to-Real Implementation

### The Golden Rule
**When replacing mock functionality with real implementations, the real version MUST be a perfect drop-in replacement for the mock.**

### Why This Matters
- The UI is already built and tested with mock data
- Users are familiar with the existing interface
- Changing data structures breaks the user experience
- It creates unnecessary refactoring work

### Implementation Process

1. **ALWAYS Study the Mock First**
   ```bash
   # Before implementing, find and analyze the mock
   grep -r "mock" src/
   # Read the exact structure
   cat src/mock-data/index.ts
   ```

2. **Document the Mock Structure**
   ```javascript
   // Example: If mock returns this:
   {
     id: '1',
     name: 'Product Documentation',
     type: 'website',
     url: 'https://docs.example.com',
     description: 'Official docs',
     documents: 156,
     lastSync: '2 hours ago',
     status: 'active'
   }
   ```

3. **Design Database to Support It**
   ```sql
   -- Create tables with ALL fields the mock has
   CREATE TABLE data_sources (
     id UUID PRIMARY KEY,
     name TEXT,
     type TEXT,  -- Must support 'website' if mock uses it
     url TEXT,
     description TEXT,  -- At root level, not in config
     documents INTEGER,
     last_sync TIMESTAMPTZ,
     status TEXT
   );
   ```

4. **API Must Return Exact Structure**
   ```javascript
   // ✅ CORRECT - Matches mock exactly
   return {
     id: row.id,
     name: row.name,
     type: row.type,
     url: row.url,
     description: row.description,
     documents: row.documents,
     lastSync: formatTimeAgo(row.last_sync),
     status: row.status
   }

   // ❌ WRONG - Different structure
   return {
     id: row.id,
     name: row.name,
     config: { url: row.url, description: row.description }
   }
   ```

5. **Test the Swap**
   ```javascript
   // Should be able to change ONLY this line:
   // const data = mockApi.getDataSources()
   const data = await fetch('/api/data-sources')
   // And everything still works!
   ```

### Checklist for Mock-to-Real Implementation

- [ ] Located and studied the mock data structure
- [ ] Documented all fields used by the UI
- [ ] Database schema supports all mock fields
- [ ] API returns exact same field names
- [ ] API returns exact same data types
- [ ] API returns exact same nested structure
- [ ] Tested by swapping mock call with API call
- [ ] UI works without ANY modifications

### Examples of What NOT to Do

❌ **Don't restructure data:**
- Mock has `description` → Don't move to `config.description`
- Mock has `channels: ['email', 'slack']` → Don't change to `channelConfig: {...}`

❌ **Don't rename fields:**
- Mock has `lastSync` → Don't change to `last_sync_at`
- Mock has `documents` → Don't change to `documentsCount`

❌ **Don't change types:**
- Mock has `type: 'website'` → Don't require `type: 'api'`
- Mock has `status: 'syncing'` → Don't remove this status option

### Project-Specific Rules

1. **Mock Data Location**: All mocks are in `/src/mock-data/index.ts`
2. **UI Components**: Already built with shadcn/ui, expecting mock structure
3. **Database**: Supabase with PostgreSQL - schema must support mock fields
4. **Type Safety**: TypeScript interfaces should match mock structure

### When Breaking Changes Are Needed

If you MUST change the structure:
1. First update the mock
2. Then update all UI components
3. Finally implement the real version
4. Never do it the other way around

---

*This file ensures consistent development practices when implementing real functionality to replace mocks.*