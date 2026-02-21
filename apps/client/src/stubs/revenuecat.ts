export const LOG_LEVEL = { DEBUG: 0 };
export const PURCHASES_ERROR_CODE = {};
export const Purchases = {
  setLogLevel: async () => {},
  configure: async () => {},
  getCustomerInfo: async () => ({ customerInfo: { managementURL: '' } }),
  restorePurchases: async () => ({}),
  getOfferings: async () => ({ current: null }),
  purchasePackage: async () => ({ customerInfo: {} }),
};
