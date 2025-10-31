interface LiquidationEntry {
  id: string;
  distributorId?: string;
  retailerId?: string;
  territory?: string;
  state?: string;
  zone?: string;
  submittedBy: string;
  submittedByRole: string;
  [key: string]: any;
}

interface UserContext {
  role: string;
  territory?: string;
  state?: string;
  zone?: string;
  id: string;
}

export const getDataScopeForRole = (role: string): 'territory' | 'state' | 'zone' | 'all' => {
  switch (role) {
    case 'MDO':
      return 'territory';
    case 'TSM':
      return 'state';
    case 'RBH':
    case 'RMM':
      return 'state';
    case 'ZBH':
      return 'zone';
    case 'MH':
    case 'VP_SM':
    case 'MD':
    case 'CHRO':
    case 'CFO':
    case 'EFFYBIZ_ADMIN':
      return 'all';
    default:
      return 'territory';
  }
};

export const filterLiquidationByRole = (
  entries: LiquidationEntry[],
  userContext: UserContext,
  subordinates?: string[]
): LiquidationEntry[] => {
  const scope = getDataScopeForRole(userContext.role);

  switch (scope) {
    case 'territory':
      return entries.filter(entry =>
        entry.territory === userContext.territory ||
        entry.submittedBy === userContext.id
      );

    case 'state':
      if (userContext.role === 'TSM') {
        return entries.filter(entry =>
          (entry.state === userContext.state && entry.territory === userContext.territory) ||
          (subordinates && subordinates.includes(entry.submittedBy)) ||
          entry.submittedBy === userContext.id
        );
      }
      return entries.filter(entry =>
        entry.state === userContext.state
      );

    case 'zone':
      return entries.filter(entry =>
        entry.zone === userContext.zone
      );

    case 'all':
      return entries;

    default:
      return entries.filter(entry =>
        entry.submittedBy === userContext.id
      );
  }
};

export const aggregateLiquidationStats = (
  entries: LiquidationEntry[],
  userContext: UserContext,
  subordinates?: string[]
) => {
  const filteredEntries = filterLiquidationByRole(entries, userContext, subordinates);

  const totalValue = filteredEntries.reduce((sum, entry) => sum + (entry.totalValue || 0), 0);
  const totalQuantity = filteredEntries.reduce((sum, entry) => sum + (entry.quantity || 0), 0);
  const uniqueDistributors = new Set(filteredEntries.map(e => e.distributorId).filter(Boolean)).size;
  const uniqueRetailers = new Set(filteredEntries.map(e => e.retailerId).filter(Boolean)).size;

  return {
    totalValue,
    totalQuantity,
    uniqueDistributors,
    uniqueRetailers,
    totalEntries: filteredEntries.length
  };
};

export const getVisibleEntityTypes = (role: string): ('distributor' | 'retailer')[] => {
  switch (role) {
    case 'MDO':
    case 'TSM':
      return ['distributor', 'retailer'];
    case 'RBH':
    case 'RMM':
    case 'ZBH':
    case 'MH':
    case 'VP_SM':
    case 'MD':
    case 'CHRO':
    case 'CFO':
    case 'EFFYBIZ_ADMIN':
      return ['distributor', 'retailer'];
    default:
      return ['distributor', 'retailer'];
  }
};

export const getSubordinatesForUser = (
  userId: string,
  role: string,
  allUsers: Array<{ id: string; role: string; reportsTo?: string; territory?: string; state?: string }>
): string[] => {
  const subordinates: string[] = [];

  if (role === 'TSM') {
    const mdosInTerritory = allUsers.filter(u =>
      u.role === 'MDO' && u.reportsTo === userId
    );
    return mdosInTerritory.map(u => u.id);
  }

  return subordinates;
};
