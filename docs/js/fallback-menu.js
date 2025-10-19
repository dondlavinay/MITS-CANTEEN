// Fallback menu items when database is unavailable
const FALLBACK_MENU = {
  snacks: [],
  veg: [],
  nonveg: [],
  juice: [],
  icecream: [],
  starters: []
};

// Enhanced API with fallback
window.APIWithFallback = {
  async getMenuItems(category) {
    try {
      const items = await API.getMenuItems(category);
      if (items && items.length > 0) {
        return items;
      }
      // Return fallback if no items or empty response
      return FALLBACK_MENU[category] || [];
    } catch (error) {
      console.log('Using fallback menu for category:', category);
      return FALLBACK_MENU[category] || [];
    }
  }
};