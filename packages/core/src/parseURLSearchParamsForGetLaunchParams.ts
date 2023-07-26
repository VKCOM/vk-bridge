import type { GetLaunchParamsResponse } from './types/data';
import {
  EGetLaunchParamsResponseLanguages,
  EGetLaunchParamsResponseGroupRole,
  EGetLaunchParamsResponsePlatforms,
} from './types/data';

export interface LaunchParams extends GetLaunchParamsResponse {
  vk_chat_id: string;
  vk_is_recommended: number;
  vk_profile_id: number;
  vk_has_profile_button: number;
  vk_testing_group_id: number;
  odr_enabled: undefined | 1;
}

/**
 * @see https://dev.vk.com/mini-apps/development/launch-params
 */
export const parseURLSearchParamsForGetLaunchParams = (
  searchParams: string,
): Partial<LaunchParams> => {
  const launchParams: Partial<LaunchParams> = {};

  try {
    const parsedSearchParams = new URLSearchParams(searchParams);

    const convertToggleStateFromStringToNumber = (value: string) => {
      switch (value) {
        case '0':
          return 0;
        case '1':
          return 1;
        default:
          return undefined;
      }
    };

    parsedSearchParams.forEach((value, query) => {
      switch (query) {
        case 'vk_ts':
        case 'vk_is_recommended':
        case 'vk_profile_id':
        case 'vk_has_profile_button':
        case 'vk_testing_group_id':
        case 'vk_user_id':
        case 'vk_app_id':
        case 'vk_group_id':
          launchParams[query] = Number(value);
          break;
        case 'sign':
        case 'vk_chat_id':
        case 'vk_ref':
        case 'vk_access_token_settings':
          launchParams[query] = value;
          break;
        case 'odr_enabled':
          launchParams['odr_enabled'] = value === '1' ? 1 : undefined;
          break;
        case 'vk_is_app_user':
        case 'vk_are_notifications_enabled':
        case 'vk_is_favorite': {
          launchParams[query] = convertToggleStateFromStringToNumber(value);
          break;
        }
        case 'vk_language': {
          const validateVKLanguage = (value: string): value is EGetLaunchParamsResponseLanguages =>
            Object.values(EGetLaunchParamsResponseLanguages).some((i) => i === value);
          launchParams['vk_language'] = validateVKLanguage(value) ? value : undefined;
          break;
        }
        case 'vk_viewer_group_role': {
          const validateVKViewerGroupRole = (
            value: string,
          ): value is EGetLaunchParamsResponseGroupRole =>
            Object.values(EGetLaunchParamsResponseGroupRole).some((i) => i === value);
          launchParams['vk_viewer_group_role'] = validateVKViewerGroupRole(value)
            ? value
            : undefined;
          break;
        }
        case 'vk_platform': {
          const validateVKPlatform = (value: string): value is EGetLaunchParamsResponsePlatforms =>
            Object.values(EGetLaunchParamsResponsePlatforms).some((i) => i === value);
          launchParams['vk_platform'] = validateVKPlatform(value) ? value : undefined;
          break;
        }
      }
    });
  } catch (e) {
    console.warn(e);
  }

  return launchParams;
};
