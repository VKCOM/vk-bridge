import { SubscribeHandler, RequestProps } from './types';
export declare const vkConnect: {
    /**
     * Sends a message to native client
     *
     * @example
     * message.send('VKWebAppInit');
     *
     * @param method The VK Connect method
     * @param [params] Message data
     */
    send<K extends "VKWebAppInit" | "VKWebAppAddToCommunity" | "VKWebAppAllowMessagesFromGroup" | "VKWebAppAllowNotifications" | "VKWebAppCallAPIMethod" | "VKWebAppGetAuthToken" | "VKWebAppClose" | "VKWebAppOpenApp" | "VKWebAppDenyNotifications" | "VKWebAppFlashGetInfo" | "VKWebAppFlashSetLevel" | "VKWebAppGetClientVersion" | "VKWebAppGetCommunityToken" | "VKWebAppGetCommunityAuthToken" | "VKWebAppCommunityAccessToken" | "VKWebAppCommunityToken" | "VKWebAppGetEmail" | "VKWebAppGetFriends" | "VKWebAppGetGeodata" | "VKWebAppGetPersonalCard" | "VKWebAppGetPhoneNumber" | "VKWebAppGetUserInfo" | "VKWebAppJoinGroup" | "VKWebAppOpenCodeReader" | "VKWebAppOpenContacts" | "VKWebAppOpenPayForm" | "VKWebAppOpenQR" | "VKWebAppResizeWindow" | "VKWebAppScroll" | "VKWebAppSetLocation" | "VKWebAppSetViewSettings" | "VKWebAppShare" | "VKWebAppShowCommunityWidgetPreviewBox" | "VKWebAppShowImages" | "VKWebAppShowInviteBox" | "VKWebAppShowLeaderBoardBox" | "VKWebAppShowMessageBox" | "VKWebAppShowOrderBox" | "VKWebAppShowRequestBox" | "VKWebAppShowWallPostBox" | "VKWebAppStorageGet" | "VKWebAppStorageGetKeys" | "VKWebAppStorageSet" | "VKWebAppTapticImpactOccurred" | "VKWebAppTapticNotificationOccurred" | "VKWebAppTapticSelectionChanged" | "VKWebAppAddToFavorites" | "VKWebAppSendPayload">(method: K, params?: RequestProps<K>): void;
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
