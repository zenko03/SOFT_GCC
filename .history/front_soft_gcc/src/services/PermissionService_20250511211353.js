// front_soft_gcc/src/services/PermissionService.js

/**
 * Service pour gérer les vérifications de permissions
 */
const PermissionService = {
    /**
     * Vérifie si l'utilisateur a une permission spécifique
     * @param {Function} hasPermissionFn - La fonction hasPermission du UserContext
     * @param {string} permission - La permission à vérifier
     * @returns {boolean} - True si l'utilisateur a la permission
     */
    hasPermission: (hasPermissionFn, permission) => {
      if (!hasPermissionFn) return false;
      return hasPermissionFn(permission);
    },
  
    /**
     * Vérifie si l'utilisateur a au moins une des permissions du groupe
     * @param {Function} hasPermissionFn - La fonction hasPermission du UserContext
     * @param {string[]} permissionGroup - Groupe de permissions
     * @returns {boolean} - True si l'utilisateur a au moins une permission du groupe
     */
    hasAnyPermission: (hasPermissionFn, permissionGroup) => {
      if (!hasPermissionFn || !Array.isArray(permissionGroup)) return false;
      return permissionGroup.some(permission => hasPermissionFn(permission));
    },
  
    /**
     * Vérifie si l'utilisateur a toutes les permissions du groupe
     * @param {Function} hasPermissionFn - La fonction hasPermission du UserContext
     * @param {string[]} permissionGroup - Groupe de permissions
     * @returns {boolean} - True si l'utilisateur a toutes les permissions du groupe
     */
    hasAllPermissions: (hasPermissionFn, permissionGroup) => {
      if (!hasPermissionFn || !Array.isArray(permissionGroup)) return false;
      return permissionGroup.every(permission => hasPermissionFn(permission));
    }
  };
  
  export default PermissionService;