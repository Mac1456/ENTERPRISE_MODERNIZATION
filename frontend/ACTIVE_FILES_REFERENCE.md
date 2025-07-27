# 🎯 ACTIVE FILES REFERENCE - Frontend Components

## ✅ **100% CONFIRMED ACTIVE FILES**

### **Pages (Active Routes)**
- **`pages/Leads_Enhanced.tsx`** ✅ **PRIMARY LEADS PAGE**
  - Route: `/leads` (App.tsx line 10, 57)
  - Status: **PRODUCTION ACTIVE**
  - This is the main leads implementation currently used

### **Components (Active Imports)**
- **`components/settings/AssignmentRulesSettings_Simple.tsx`** ✅ **ACTIVE SETTINGS**
  - Import: Settings.tsx line 23
  - Status: **PRODUCTION ACTIVE** 
  - This is the current assignment rules implementation

### **Test-Required Files**
- **`pages/Leads.tsx`** ✅ **EXTENSIVELY TESTED**
  - Tests: `__tests__/Leads.test.tsx` (352 lines)
  - Status: **ACTIVE** - Required for test infrastructure
  - DO NOT REMOVE - Has comprehensive test coverage

## ⚠️ **POTENTIALLY UNUSED FILES**

### **Alternative Implementations**
- **`pages/LeadsCRMHubStyle.tsx`** ⚠️ **NO IMPORTS FOUND**
  - Status: Unclear - appears to be alternative leads implementation
  - No active routes or imports detected
  - May be part of development evolution

- **`components/settings/AssignmentRulesSettings.tsx`** ⚠️ **NOT IMPORTED**
  - Status: Full version not used - Simple version active instead
  - More complex implementation that appears replaced
  - Settings.tsx uses `_Simple` version instead

## 🎯 **Quick Reference for Developers**

### **Which Leads Component to Use?**
- **For `/leads` route**: Use `Leads_Enhanced.tsx` ✅
- **For testing**: Keep `Leads.tsx` ✅ (has 352-line test suite)
- **Avoid**: `LeadsCRMHubStyle.tsx` ⚠️ (no imports found)

### **Which Settings Component to Use?**
- **For settings page**: Use `AssignmentRulesSettings_Simple.tsx` ✅
- **Avoid**: `AssignmentRulesSettings.tsx` ⚠️ (not imported)

## 📝 **File Markers Added**

All files now have clear header comments:
- ✅ **Active files**: Marked with `✅ ACTIVE COMPONENT`
- ⚠️ **Potentially unused**: Marked with `⚠️ POTENTIALLY UNUSED`

## 🔍 **How to Verify**

To confirm a file is active:
1. Check if it's imported in `App.tsx` (for routes)
2. Check if it's imported in other components
3. Check if it has test coverage in `__tests__/`
4. Look for the header comment markers

---

**Last Updated**: July 27, 2024  
**Status**: All active files clearly marked  
**Purpose**: Eliminate confusion about which files to use 