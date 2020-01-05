/** Is the client side runtime environment */
export const IS_CLIENT_SIDE = typeof window !== 'undefined';

/** Is the runtime environment an Android app */
export const IS_ANDROID_WEBVIEW = Boolean(IS_CLIENT_SIDE && window.AndroidBridge);

/** Is the runtime environment an iOS app */
export const IS_IOS_WEBVIEW = Boolean(
  IS_CLIENT_SIDE && window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.VKWebAppClose
);

/** Is the runtime environment a browser */
export const IS_WEB = !IS_ANDROID_WEBVIEW && !IS_IOS_WEBVIEW;

/** Type of subscribe event */
export const EVENT_TYPE = IS_WEB ? 'message' : 'VKWebAppEvent';

/** Methods supported on the desktop */
export const DESKTOP_METHODS = [
  'VKWebAppInit',
  'VKWebAppGetCommunityAuthToken',
  'VKWebAppAddToCommunity',
  'VKWebAppGetUserInfo',
  'VKWebAppSetLocation',
  'VKWebAppGetClientVersion',
  'VKWebAppGetPhoneNumber',
  'VKWebAppGetEmail',
  'VKWebAppGetGeodata',
  'VKWebAppSetTitle',
  'VKWebAppGetAuthToken',
  'VKWebAppCallAPIMethod',
  'VKWebAppJoinGroup',
  'VKWebAppAllowMessagesFromGroup',
  'VKWebAppDenyNotifications',
  'VKWebAppAllowNotifications',
  'VKWebAppOpenPayForm',
  'VKWebAppOpenApp',
  'VKWebAppShare',
  'VKWebAppShowWallPostBox',
  'VKWebAppScroll',
  'VKWebAppResizeWindow',
  'VKWebAppShowOrderBox',
  'VKWebAppShowLeaderBoardBox',
  'VKWebAppShowInviteBox',
  'VKWebAppShowRequestBox',
  'VKWebAppAddToFavorites',
  'VKWebAppShowCommunityWidgetPreviewBox'
];
