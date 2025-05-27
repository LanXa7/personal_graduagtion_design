/**
 * 角色工具类
 * 提供角色代码到中文名称的映射
 */
import { getDictLabel } from "@/utils/dict";

// 角色代码到中文名称的映射（备用）
export const roleNameMap: Record<string, string> = {
  'super_admin': '超级管理员',
  'canteen_admin': '食堂管理员',
  'stall_admin': '摊位管理员',
  'normal': '普通用户'
};

// 可能的角色相关字典类型
const ROLE_DICT_TYPES = [
  'role_type',
  'user_role', 
  'sys_role', 
  'role',
  'roles'
];

/**
 * 获取角色中文名称
 * @param code 角色代码
 * @returns 角色的中文名称
 */
export const getRoleName = (code?: string): string => {
  if (!code) return '未知角色';
  
  // 直接使用备用映射，确保角色名称正确显示
  if (roleNameMap[code]) {
    return roleNameMap[code];
  }
  
  // 如果不在备用映射中，尝试从字典获取
  // 依次尝试从可能的字典类型中查找
  for (const dictType of ROLE_DICT_TYPES) {
    const label = getDictLabel(dictType, code);
    if (label) {
      return label;
    }
  }
  
  // 如果从字典中没有找到，则使用代码本身
  return code;
};

/**
 * 检查用户是否具有特定角色
 * @param roles 用户角色列表
 * @param role 要检查的角色代码
 * @returns 是否具有该角色
 */
export const hasRole = (roles: string[] | undefined, role: string): boolean => {
  if (!roles || roles.length === 0) return false;
  return roles.includes(role);
};

/**
 * 检查用户是否是超级管理员
 * @param roles 用户角色列表
 * @returns 是否是超级管理员
 */
export const isSuperAdmin = (roles: string[] | undefined): boolean => {
  return hasRole(roles, 'super_admin');
};

/**
 * 检查用户是否是食堂管理员
 * @param roles 用户角色列表
 * @returns 是否是食堂管理员
 */
export const isCanteenAdmin = (roles: string[] | undefined): boolean => {
  return hasRole(roles, 'canteen_admin');
};

/**
 * 检查用户是否是摊位管理员
 * @param roles 用户角色列表
 * @returns 是否是摊位管理员
 */
export const isStallAdmin = (roles: string[] | undefined): boolean => {
  return hasRole(roles, 'stall_admin');
};

/**
 * 检查用户是否是普通用户
 * @param roles 用户角色列表
 * @returns 是否是普通用户
 */
export const isNormalUser = (roles: string[] | undefined): boolean => {
  return hasRole(roles, 'normal');
};

/**
 * 检查用户是否有任何管理员权限
 * @param roles 用户角色列表
 * @returns 是否有管理员权限
 */
export const hasAdminPermission = (roles: string[] | undefined): boolean => {
  if (!roles || roles.length === 0) return false;
  return roles.some(role => 
    role === 'super_admin' || 
    role === 'canteen_admin' || 
    role === 'stall_admin'
  );
}; 