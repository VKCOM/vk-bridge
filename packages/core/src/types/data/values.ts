export type ElementSetType<T> = T extends Set<infer U> ? U : never;

export const getLaunchParamsResponseLanguagesSet = new Set([
  'ru',
  'uk',
  'ua',
  'en',
  'be',
  'kz',
  'pt',
  'es',
] as const);

export const getLaunchParamsResponseGroupRoleSet = new Set([
  'admin',
  'editor',
  'member',
  'moder',
  'none',
] as const);

export const getLaunchParamsResponsePlatformsSet = new Set([
  'desktop_web',
  'desktop_web_messenger',
  'desktop_app_messenger',
  'mobile_web',
  'mobile_android',
  'mobile_android_messenger',
  'mobile_iphone',
  'mobile_iphone_messenger',
  'mobile_ipad',
] as const);
