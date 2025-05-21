// Dictionnaire des permissions fonctionnelles
const permissionMap = new Map([
  // Permissions d'évaluation (clé fonctionnelle -> nom réel dans la BD)
  ['IMPORT_EVALUATION', 'MANAGE_EVALUATIONS'],
  ['FILL_EVALUATION', 'MANAGE_EVALUATIONS'],
  ['VIEW_EVALUATION_DETAILS', 'MANAGE_EVALUATIONS'],
  ['VALIDATE_AS_MANAGER', 'MANAGE_EVALUATIONS'],
  ['VALIDATE_AS_DIRECTOR', 'MANAGE_EVALUATIONS'],
  ['PLAN_INTERVIEWS', 'MANAGE_EVALUATIONS'],
  
  // Permissions utilisateur
  ['MANAGE_USERS_LIST', 'MANAGE_USERS'],
  ['MANAGE_ROLES_LIST', 'MANAGE_ROLES'],
  ['MANAGE_PERMISSIONS_LIST', 'MANAGE_PERMISSIONS'],
]);

// Dictionnaire des rôles fonctionnels
const roleMap = new Map([
  // Rôles fonctionnels (clé fonctionnelle -> ID réels possibles)
  ['RH_ROLE', [1]], // L'ID 1 correspond au rôle RH/Admin
  ['MANAGER_ROLE', [2, 3]], // Les IDs 2 ou 3 peuvent être des managers
  ['DIRECTOR_ROLE', [4]], // L'ID 4 correspond au rôle Director
]);

/**
 * Vérifie si l'utilisateur a une permission spécifique en utilisant le nom fonctionnel
 * @param {Function} hasPermissionFn - La fonction hasPermission du UserContext
 * @param {string} functionalPermission - La clé fonctionnelle de la permission
 * @returns {boolean} - True si l'utilisateur a la permission, sinon false
 */
export const checkFunctionalPermission = (hasPermissionFn, functionalPermission) => {
  // Si la clé n'existe pas dans le dictionnaire, utiliser la clé telle quelle
  const actualPermission = permissionMap.get(functionalPermission) || functionalPermission;
  return hasPermissionFn(actualPermission);
};

/**
 * Vérifie si l'utilisateur a un rôle spécifique en utilisant le nom fonctionnel
 * @param {Object} user - L'objet utilisateur provenant du UserContext
 * @param {string} functionalRole - La clé fonctionnelle du rôle
 * @returns {boolean} - True si l'utilisateur a le rôle, sinon false
 */
export const checkFunctionalRole = (user, functionalRole) => {
  if (!user || !user.roleId) return false;
  
  // Récupérer les IDs de rôle correspondant à la clé fonctionnelle
  const roleIds = roleMap.get(functionalRole);
  
  // Si la clé n'existe pas dans le dictionnaire, retourner false
  if (!roleIds) return false;
  
  // Vérifier si l'ID de rôle de l'utilisateur est dans la liste
  return roleIds.includes(user.roleId);
};

/**
 * Vérifie si l'utilisateur est un RH
 * @param {Object} user - L'objet utilisateur provenant du UserContext
 * @returns {boolean} - True si l'utilisateur est un RH, sinon false
 */
export const isRH = (user) => checkFunctionalRole(user, 'RH_ROLE');

/**
 * Vérifie si l'utilisateur est un Manager
 * @param {Object} user - L'objet utilisateur provenant du UserContext
 * @returns {boolean} - True si l'utilisateur est un Manager, sinon false
 */
export const isManager = (user) => checkFunctionalRole(user, 'MANAGER_ROLE');

/**
 * Vérifie si l'utilisateur est un Directeur
 * @param {Object} user - L'objet utilisateur provenant du UserContext
 * @returns {boolean} - True si l'utilisateur est un Directeur, sinon false
 */
export const isDirector = (user) => checkFunctionalRole(user, 'DIRECTOR_ROLE');

/**
 * Obtient les clés fonctionnelles à partir des noms réels de permissions
 * @param {Array} permissions - Liste des permissions de l'utilisateur
 * @returns {Array} - Liste des clés fonctionnelles correspondantes
 */
export const getFunctionalPermissions = (permissions) => {
  if (!Array.isArray(permissions)) return [];
  
  const functionalPermissions = [];
  
  // Pour chaque permission réelle, trouver toutes les clés fonctionnelles correspondantes
  permissions.forEach(permission => {
    for (const [functionalKey, actualPermission] of permissionMap.entries()) {
      if (permission.name === actualPermission && !functionalPermissions.includes(functionalKey)) {
        functionalPermissions.push(functionalKey);
      }
    }
  });
  
  return functionalPermissions;
};

export default {
  checkFunctionalPermission,
  checkFunctionalRole,
  isRH,
  isManager,
  isDirector,
  getFunctionalPermissions
}; 