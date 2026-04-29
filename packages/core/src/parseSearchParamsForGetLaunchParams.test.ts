/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { parseURLSearchParamsForGetLaunchParams } from './parseURLSearchParamsForGetLaunchParams.ts';

describe('parseLaunchParamsByURL', () => {
  it('should return the vk_language field if it valid', () => {
    assert.deepStrictEqual(parseURLSearchParamsForGetLaunchParams('vk_language=ru'), {
      vk_language: 'ru',
    });
    assert.deepStrictEqual(parseURLSearchParamsForGetLaunchParams('vk_language=unknown'), {
      vk_language: undefined,
    });
  });

  it('should return the vk_viewer_group_role field if it valid', () => {
    assert.deepStrictEqual(parseURLSearchParamsForGetLaunchParams('vk_viewer_group_role=admin'), {
      vk_viewer_group_role: 'admin',
    });
    assert.deepStrictEqual(parseURLSearchParamsForGetLaunchParams('vk_viewer_group_role=unknown'), {
      vk_viewer_group_role: undefined,
    });
  });

  it('should return the vk_platform field if it valid', () => {
    assert.deepStrictEqual(parseURLSearchParamsForGetLaunchParams('vk_platform=desktop_web'), {
      vk_platform: 'desktop_web',
    });
    assert.deepStrictEqual(parseURLSearchParamsForGetLaunchParams('vk_platform=unknown'), {
      vk_platform: undefined,
    });
  });

  it('should return converted toggle state from string to number if it valid', () => {
    assert.deepStrictEqual(
      parseURLSearchParamsForGetLaunchParams(
        'vk_is_app_user=0&vk_are_notifications_enabled=0&vk_is_favorite=0',
      ),
      {
        vk_is_app_user: 0,
        vk_are_notifications_enabled: 0,
        vk_is_favorite: 0,
      },
    );
    assert.deepStrictEqual(
      parseURLSearchParamsForGetLaunchParams(
        'vk_is_app_user=1&vk_are_notifications_enabled=1&vk_is_favorite=1',
      ),
      {
        vk_is_app_user: 1,
        vk_are_notifications_enabled: 1,
        vk_is_favorite: 1,
      },
    );
    assert.deepStrictEqual(
      parseURLSearchParamsForGetLaunchParams(
        'vk_is_app_user=3&vk_are_notifications_enabled=3&vk_is_favorite=3',
      ),
      {
        vk_is_app_user: undefined,
        vk_are_notifications_enabled: undefined,
        vk_is_favorite: undefined,
      },
    );
  });

  it('should return converted to number value', () => {
    assert.deepStrictEqual(
      parseURLSearchParamsForGetLaunchParams(
        'vk_ts=123&vk_is_recommended=456&vk_profile_id=789&vk_has_profile_button=101&vk_testing_group_id=102&vk_user_id=103&vk_app_id=104&vk_group_id=105',
      ),
      {
        vk_ts: 123,
        vk_is_recommended: 456,
        vk_profile_id: 789,
        vk_has_profile_button: 101,
        vk_testing_group_id: 102,
        vk_user_id: 103,
        vk_app_id: 104,
        vk_group_id: 105,
      },
    );
  });

  it('should return value as is', () => {
    assert.deepStrictEqual(
      parseURLSearchParamsForGetLaunchParams(
        'sign=some_sign123&vk_chat_id=some_vk_chat_id123&vk_ref=some_vk_ref123&vk_access_token_settings=some_vk_access_token_settings123',
      ),
      {
        sign: 'some_sign123',
        vk_chat_id: 'some_vk_chat_id123',
        vk_ref: 'some_vk_ref123',
        vk_access_token_settings: 'some_vk_access_token_settings123',
      },
    );
  });

  // see https://dev.vk.ru/mini-apps/development/launch-params?vk_are_notifications_enabled=1#odr_enabled
  it('should return 1 or undefined', () => {
    assert.deepStrictEqual(parseURLSearchParamsForGetLaunchParams('odr_enabled=1'), {
      odr_enabled: 1,
    });
    assert.deepStrictEqual(parseURLSearchParamsForGetLaunchParams('odr_enabled=0'), {
      odr_enabled: undefined,
    });
    assert.deepStrictEqual(parseURLSearchParamsForGetLaunchParams('odr_enabled=unknown'), {
      odr_enabled: undefined,
    });
  });
});
