const PermissionService = {
    // Mapping des permissions (avec potentiels alias)
    // Permet de gérer les changements de noms sans modifier le code partout
    PERMISSION_MAPPING: {
      // Permissions pour les interviews d'évaluation
      'IMPORT_EVALUATION': ['MANAGE_EVALUATIONS'],
      'FILL_EVALUATION': ['MANAGE_EVALUATIONS'],
      'VIEW_EVALUATION_DETAILS': ['MANAGE_EVALUATIONS'],
      'VALIDATE_AS_MANAGER': ['VALIDATE_EVALUATIONS_MANAGER'],
      'VALIDATE_AS_DIRECTOR': ['VALIDATE_EVALUATIONS_DIRECTOR']
    },
  
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
     * Vérifie si l'utilisateur a une permission fonctionnelle (utilise le mapping)
     * @param {Function} hasPermissionFn - La fonction hasPermission du UserContext
     * @param {string} functionalPermission - La clé fonctionnelle de la permission
     * @returns {boolean} - True si l'utilisateur a une des permissions mappées
     */
    hasFunctionalPermission: (hasPermissionFn, functionalPermission) => {
      if (!hasPermissionFn) return false;
  
      // Vérifier d'abord si la permission fonctionnelle existe directement
      if (hasPermissionFn(functionalPermission)) return true;
  
      // Vérifier ensuite dans le mapping
      const mappedPermissions = PermissionService.PERMISSION_MAPPING[functionalPermission] || [];
      return mappedPermissions.some(permission => hasPermissionFn(permission));
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