const PermissionService = {
  // Clés pour le stockage local
  STORAGE_KEYS: {
    PERMISSION_MAPPING: 'permission_mapping',
    PERMISSION_ALIASES: 'permission_aliases'
  },

  // Mapping des permissions (avec potentiels alias)
  // Permet de gérer les changements de noms sans modifier le code partout
  _PERMISSION_MAPPING: {
    // Permissions pour les interviews d'évaluation
    'IMPORT_EVALUATION': ['MANAGE_EVALUATIONS'],
    'FILL_EVALUATION': ['MANAGE_EVALUATIONS'],
    'VIEW_EVALUATION_DETAILS': ['MANAGE_EVALUATIONS'],
    'VALIDATE_AS_MANAGER': ['VALIDATE_EVALUATIONS_MANAGER'],
    'VALIDATE_AS_DIRECTOR': ['VALIDATE_EVALUATIONS_DIRECTOR']
  },
  
  // Dictionnaire d'alias pour gérer la transition entre anciens et nouveaux noms
  _PERMISSION_ALIASES: {
    // Exemple : 'ANCIEN_NOM': 'NOUVEAU_NOM'
    'VALIDATE_MANAGER': 'VALIDATE_EVALUATIONS_MANAGER',
    'VALIDATE_DIRECTOR': 'VALIDATE_EVALUATIONS_DIRECTOR',
    'IMPORT_EVAL': 'MANAGE_EVALUATIONS',
    'EDIT_EVAL': 'MANAGE_EVALUATIONS'
  },

  /**
   * Initialise le service en chargeant les configurations depuis le localStorage
   * ou en utilisant les valeurs par défaut
   */
  initialize() {
    try {
      // Essayer de charger les mappings depuis localStorage
      const storedMapping = localStorage.getItem(this.STORAGE_KEYS.PERMISSION_MAPPING);
      if (storedMapping) {
        this._PERMISSION_MAPPING = JSON.parse(storedMapping);
      }

      const storedAliases = localStorage.getItem(this.STORAGE_KEYS.PERMISSION_ALIASES);
      if (storedAliases) {
        this._PERMISSION_ALIASES = JSON.parse(storedAliases);
      }

      console.log('PermissionService initialisé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du PermissionService:', error);
      // En cas d'erreur, on utilise les valeurs par défaut
    }
  },

  /**
   * Met à jour les mappings et les stocke dans localStorage
   * @param {Object} mapping - Nouveau mapping de permissions
   * @param {Object} aliases - Nouveaux alias de permissions
   */
  updateMappings(mapping, aliases) {
    try {
      if (mapping) {
        this._PERMISSION_MAPPING = { ...this._PERMISSION_MAPPING, ...mapping };
        localStorage.setItem(this.STORAGE_KEYS.PERMISSION_MAPPING, JSON.stringify(this._PERMISSION_MAPPING));
      }
      
      if (aliases) {
        this._PERMISSION_ALIASES = { ...this._PERMISSION_ALIASES, ...aliases };
        localStorage.setItem(this.STORAGE_KEYS.PERMISSION_ALIASES, JSON.stringify(this._PERMISSION_ALIASES));
      }
      
      console.log('Mappings mis à jour avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des mappings:', error);
      return false;
    }
  },

  /**
   * Charge les mappings depuis l'API (à implémenter selon votre API)
   * @returns {Promise<boolean>} - True si le chargement a réussi
   */
  async loadMappingsFromAPI() {
    try {
      // Exemple d'appel API - à adapter selon votre backend
      const response = await fetch('https://localhost:7082/api/Permission/mappings');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.mappings) {
          this.updateMappings(data.mappings, null);
        }
        
        if (data.aliases) {
          this.updateMappings(null, data.aliases);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors du chargement des mappings depuis l\'API:', error);
      return false;
    }
  },

  /**
   * Obtient le mapping de permissions actuel
   */
  get PERMISSION_MAPPING() {
    return this._PERMISSION_MAPPING;
  },

  /**
   * Obtient les alias de permissions actuels
   */
  get PERMISSION_ALIASES() {
    return this._PERMISSION_ALIASES;
  },

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   * @param {Function} hasPermissionFn - La fonction hasPermission du UserContext
   * @param {string} permission - La permission à vérifier
   * @returns {boolean} - True si l'utilisateur a la permission
   */
  hasPermission: (hasPermissionFn, permission) => {
    if (!hasPermissionFn) return false;
    
    // Vérifier d'abord avec le nom original
    if (hasPermissionFn(permission)) return true;
    
    // Vérifier avec l'alias si disponible
    const aliasedPermission = PermissionService._PERMISSION_ALIASES[permission];
    if (aliasedPermission && hasPermissionFn(aliasedPermission)) return true;
    
    return false;
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
    if (PermissionService.hasPermission(hasPermissionFn, functionalPermission)) return true;

    // Vérifier ensuite dans le mapping
    const mappedPermissions = PermissionService._PERMISSION_MAPPING[functionalPermission] || [];
    return mappedPermissions.some(permission => PermissionService.hasPermission(hasPermissionFn, permission));
  },

  /**
   * Vérifie si l'utilisateur a au moins une des permissions du groupe
   * @param {Function} hasPermissionFn - La fonction hasPermission du UserContext
   * @param {string[]} permissionGroup - Groupe de permissions
   * @returns {boolean} - True si l'utilisateur a au moins une permission du groupe
   */
  hasAnyPermission: (hasPermissionFn, permissionGroup) => {
    if (!hasPermissionFn || !Array.isArray(permissionGroup)) return false;
    return permissionGroup.some(permission => PermissionService.hasPermission(hasPermissionFn, permission));
  },

  /**
   * Vérifie si l'utilisateur a toutes les permissions du groupe
   * @param {Function} hasPermissionFn - La fonction hasPermission du UserContext
   * @param {string[]} permissionGroup - Groupe de permissions
   * @returns {boolean} - True si l'utilisateur a toutes les permissions du groupe
   */
  hasAllPermissions: (hasPermissionFn, permissionGroup) => {
    if (!hasPermissionFn || !Array.isArray(permissionGroup)) return false;
    return permissionGroup.every(permission => PermissionService.hasPermission(hasPermissionFn, permission));
  }
};

// Initialiser le service au chargement
PermissionService.initialize();

export default PermissionService;