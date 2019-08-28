import { SubscribeHandler, RequestProps } from './types';
declare const vkConnect: {
    /**
     * Sends a message to native client
     *
     * @example
     * message.send('VKWebAppInit');
     *
     * @param method The VK Connect method
     * @param [params] Message data
     */
    send<K extends "VKWebAppInit" | "VKWebAppGetCommunityAuthToken" | "VKWebAppAddToCommunity" | "VKWebAppGetUserInfo" | "VKWebAppSetLocation" | "VKWebAppGetClientVersion" | "VKWebAppGetPhoneNumber" | "VKWebAppGetEmail" | "VKWebAppGetGeodata" | "VKWebAppGetAuthToken" | "VKWebAppCallAPIMethod" | "VKWebAppJoinGroup" | "VKWebAppAllowMessagesFromGroup" | "VKWebAppDenyNotifications" | "VKWebAppAllowNotifications" | "VKWebAppOpenPayForm" | "VKWebAppOpenApp" | "VKWebAppShare" | "VKWebAppShowWallPostBox" | "VKWebAppScroll" | "VKWebAppResizeWindow" | "VKWebAppShowOrderBox" | "VKWebAppShowLeaderBoardBox" | "VKWebAppShowInviteBox" | "VKWebAppShowRequestBox" | "VKWebAppAddToFavorites" | "VKWebAppClose" | "VKWebAppFlashGetInfo" | "VKWebAppFlashSetLevel" | "VKWebAppGetCommunityToken" | "VKWebAppCommunityAccessToken" | "VKWebAppCommunityToken" | "VKWebAppGetFriends" | "VKWebAppGetPersonalCard" | "VKWebAppOpenCodeReader" | "VKWebAppOpenContacts" | "VKWebAppOpenQR" | "VKWebAppSetViewSettings" | "VKWebAppShowCommunityWidgetPreviewBox" | "VKWebAppShowImages" | "VKWebAppShowMessageBox" | "VKWebAppStorageGet" | "VKWebAppStorageGetKeys" | "VKWebAppStorageSet" | "VKWebAppTapticImpactOccurred" | "VKWebAppTapticNotificationOccurred" | "VKWebAppTapticSelectionChanged" | "VKWebAppSendPayload">(method: K, params?: RequestProps<K>): void;
    /**
     * Subscribe on VKWebAppEvent
     *
     * @param fn Event handler
     */
    subscribe(fn: SubscribeHandler): void;
    /**
     * Unsubscribe on VKWebAppEvent
     *
     * @param fn Event handler
     */
    unsubscribe(fn: SubscribeHandler): void;
    /**
     * Checks if it is client webview
     */
    isWebView(): boolean;
    /**
     * Checks if native client supports handler
     *
     * @param method The VK Connect method
     */
    supports(method: string): boolean;
};
/**
 * Type of VK Connect interface
 */
export declare type VKConnect = typeof vkConnect;
export * from './types';
export default vkConnect;
