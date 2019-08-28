/**
 * Type of the Personal Card
 */
export declare type PersonalCardType = 'phone' | 'email' | 'address';
/**
 * Type of user info object
 */
export declare type UserInfo = {
    /** User id */
    id: number;
    /** User name */
    first_name: string;
    /** User surname */
    last_name: string;
    /** User sex: 0 - not specified, 1 - female, 2 - male */
    sex: 0 | 1 | 2;
    /** User's city */
    city: {
        /** City ID */
        id: number;
        /** City title */
        title: string;
    };
    /** User's country */
    country: {
        /** Country ID */
        id: number;
        /** Country  title */
        title: string;
    };
    /**
     * Date of Birth. It is returned in the format D.M.YYYY or D.M (if the
     * year of birth is hidden). If the date of birth is hidden entirely,
     * the field is not in the response.
     */
    bdate?: string;
    /**
     * URL of the square user's photo with 100px width.
     * https://vk.com/images/camera_100.png will be returned if the photo
     * is not set.
     */
    photo_100: string;
    /**
     * URL of the square user's photo with 200px width.
     * https://vk.com/images/camera_200.png will be returned if the photo
     * is not set.
     */
    photo_200: string;
    /**
     * URL of the square user's photo with maximum size.
     * https://vk.com/images/camera_400.png will be returned if the photo
     * is not set.
     */
    photo_max_orig?: string;
    /** User's timezone */
    timezone: number;
};
/**
 * User's contact data from the Personal Card from
 */
export declare type PersonalCardData = {
    phone?: string;
    email?: string;
    address?: {
        country?: {
            id: number;
            name: string;
        };
        city?: {
            id: number;
            name: string;
        };
        specified_address?: string;
        postal_code?: string;
    };
};
/**
 * Map of VK Pay request params
 */
export declare type VKPayActionParamsMap = {
    /** Payment with a given amount to a user */
    'pay-to-user': {
        /** The amount of payment in rubles. The minimum value is 1 */
        amount?: number;
        /** User ID */
        user_id: number;
        /** Payment description */
        description?: string;
    };
    /** Payment with a given amount to a community */
    'pay-to-group': {
        /** The amount of payment in rubles. The minimum value is 1 */
        amount: number;
        /** Community ID */
        group_id: number;
        /** Payment description */
        description?: string;
        /** Dictionary with arbitrary parameters */
        data?: string;
    };
    /** Transferring an arbitrary amount to a user */
    'transfer-to-user': {
        user_id: number;
    };
    /** Transferring an arbitrary amount to a community */
    'transfer-to-group': {
        group_id: number;
    };
    /**
     * Payment in favor of the merchant
     * @see {@link https://vk.com/@devpay-vk-pay-how-to}
     */
    'pay-to-service': {
        /**
         * Amount of payment. The minimum value is 1. The amount field is
         * involved in the formation of merchant_data for the signature of
         * the seller.
         */
        amount: number | string;
        /**
         * Description of the payment for user. The text will be shown in
         * payment dialog
         */
        description: string;
        /**
         * Merchant ID. This is your ID in the payment system, obtained after
         * the conclusion of the contract along with the seller’s private key
         */
        merchant_id: number;
        /** Version of the payment form */
        version: number;
        /** The signature of the VK app that caused the payment */
        sign: string;
        /** Service data */
        data: {
            /** Currency. Only RUB is currently supported */
            currency: 'RUB';
            /** Base64-string of data for the signature of the seller */
            merchant_data: string;
            /** SHA-1 seller sign */
            merchant_sign: string;
            /** Sales order id */
            order_id: string | number;
            /** Timestamp */
            ts: number;
            /** Cashback data */
            cashback?: {
                /** Cashback timestamp */
                pay_time: number;
                /** Cashback size */
                amount?: number;
                /** Percentage cashback size */
                amount_percent?: number;
            };
        };
    };
};
/**
 * Possible types VK Pay operations
 */
export declare type VKPayActionType = keyof VKPayActionParamsMap;
/**
 * VK Pay request props
 */
export declare type VKPayProps<ActionType extends VKPayActionType> = {
    app_id: number;
    action: ActionType;
    params: VKPayActionParamsMap[ActionType];
};
/**
 * Appearance type
 */
export declare type AppearanceType = 'light' | 'dark';
/**
 * Application color scheme type
 */
export declare type AppearanceSchemeType = 'client_light' | 'client_dark';
/**
 * Vibration type for Taptic Engine
 */
export declare type TapticVibrationPowerType = 'light' | 'medium' | 'heavy';
/**
 * Notification type for Taptic Engine
 */
export declare type TapticNotificationType = 'error' | 'success' | 'warning';
/** Status of showing order box */
export declare type OrderBoxShowingStatus = 'cancel' | 'success' | 'fail';
/**
 * Widget type
 */
export declare type WidgetType = 'text' | 'list' | 'table' | 'tiles' | 'compact_list' | 'cover_list' | 'match' | 'matches';
/**
 * Output data from code reader
 */
export declare type CodeReaderOutput = {
    /** Read QR code data */
    code_data: string;
};
/**
 * Selected contact data
 */
export declare type SelectedContact = {
    phone: string;
    first_name: string;
    last_name: string;
};
/**
 * Request result data
 */
export declare type RequestResult = {
    /** Operation success */
    success: boolean;
    /** `requestKey` from request */
    requestKey: string;
};
/**
 * Result data of transaction
 */
export declare type TransactionResult = {
    /** Payment (true — successful, false — unsuccessful). */
    status: boolean;
    /** Payment transaction identifier (for `status=true`). */
    transaction_id: string;
    /** Payment amount */
    amount: string;
    /** Additional information of the seller */
    extra?: string | null;
};
/**
 * Update config data
 */
export declare type UpdateConfigData = {
    app: 'vkclient' | 'vkme';
    app_id: string;
    appearance: AppearanceType;
    scheme: AppearanceSchemeType;
    insets: {
        top: number;
        left: number;
        right: number;
        bottom: number;
    };
    start_time: number;
};
export declare type WidgetPreviewRequestOptions = {
    /** Widget type */
    type: WidgetType;
    /** Community ID */
    group_id: number;
    /**
     * Widget code
     * @see {@link https://vk.com/dev/execute | Execute method}
     */
    code: string;
};
/**
 * App close status
 */
export declare type AppCloseStatus = 'success' | 'failed';
export declare type CommunityTokenRequestOptions = {
    app_id: number;
    group_id: number;
    scope: string;
};
export declare type MessageRequestOptions = {
    /** Receiver ID (user, community, chat) */
    peer_id: number;
    /** Message text */
    message: string;
    /** List of attaches */
    attachment?: string;
    /** Geographic latitude of a point, specified in degrees (from -90 to 90). */
    lat?: number;
    /** Geographic longitude of a point, specified in degrees (from -180 to 180). */
    lng?: number;
};
export declare type OrderRequestOptions = {
    /** Always `item` */
    type: 'item';
    /**
     * Name of product. Will be transmitted in the notification of receipt
     * of product information
     */
    item: string;
};
export declare type RequestForRequestOptions = {
    /** User Id */
    uid: number;
    /** Request test */
    message: string;
    /**
     * Optional parameter. Custom string to track conversion. It is passed
     * in the application launch parameters in case of launch from the
     * request.
     */
    requestKey?: string;
};
export declare type WallPostRequestOptions = {
    /**
     * ID of the user or community on whose wall the post is to be
     * published
     */
    owner_id?: number;
    /**
     * `true` - the post posted on behalf of the community will have a
     * signature added (the name of the user who posted the post)
     * `false` - the signature will not be added. The parameter is taken
     * into account only when publishing on the community wall and
     * specifying the from_group parameter. By default, the signature is
     * not added
     */
    signed?: boolean;
    /** Latitude, specified in degrees (from -90 to 90) */
    lat?: number;
    /** Longitude, specified in degrees (от -180 до 180) */
    long?: number;
    /** The place ID where the user is marked */
    place_id?: number;
} & ({
    message?: string;
    attachments: string;
} | {
    message: string;
    attachments?: string;
});
/**
 * Map of types of request props
 *
 * @todo Decompose me
 */
export declare type RequestMethodPropsMap = {
    VKWebAppInit: {};
    VKWebAppAddToCommunity: {};
    VKWebAppAllowMessagesFromGroup: {
        group_id: number;
        key?: string;
    };
    VKWebAppAllowNotifications: {};
    VKWebAppCallAPIMethod: {
        method: string;
        params: Record<string, string | number>;
    };
    VKWebAppGetAuthToken: {
        app_id: number;
        scope: string;
    };
    VKWebAppClose: {
        status: AppCloseStatus;
        payload?: any;
    };
    VKWebAppOpenApp: {
        app_id: number;
        location?: string;
    };
    VKWebAppDenyNotifications: {};
    VKWebAppFlashGetInfo: {};
    VKWebAppFlashSetLevel: {
        level: number;
    };
    VKWebAppGetClientVersion: {};
    VKWebAppGetCommunityToken: CommunityTokenRequestOptions;
    VKWebAppGetCommunityAuthToken: CommunityTokenRequestOptions;
    VKWebAppCommunityAccessToken: CommunityTokenRequestOptions;
    VKWebAppCommunityToken: CommunityTokenRequestOptions;
    VKWebAppGetEmail: {};
    VKWebAppGetFriends: {
        multi?: boolean;
    };
    VKWebAppGetGeodata: {};
    VKWebAppGetPersonalCard: {
        type: PersonalCardType[];
    };
    VKWebAppGetPhoneNumber: {};
    VKWebAppGetUserInfo: {};
    VKWebAppJoinGroup: {
        group_id: number;
    };
    VKWebAppOpenCodeReader: {};
    VKWebAppOpenContacts: {};
    VKWebAppOpenPayForm: VKPayProps<VKPayActionType>;
    VKWebAppOpenQR: {};
    VKWebAppResizeWindow: {
        width?: number;
        height: number;
    };
    VKWebAppScroll: {
        top: number;
        speed?: number;
    };
    VKWebAppSetLocation: {
        location: string;
    };
    VKWebAppSetViewSettings: {
        status_bar_style: AppearanceType;
        action_bar_color?: string;
    };
    VKWebAppShare: {
        link: string;
    };
    VKWebAppShowCommunityWidgetPreviewBox: WidgetPreviewRequestOptions;
    VKWebAppShowImages: {};
    VKWebAppShowInviteBox: {};
    VKWebAppShowLeaderBoardBox: {
        user_result: number;
    };
    VKWebAppShowMessageBox: MessageRequestOptions;
    VKWebAppShowOrderBox: OrderRequestOptions;
    VKWebAppShowRequestBox: RequestForRequestOptions;
    VKWebAppShowWallPostBox: WallPostRequestOptions;
    VKWebAppStorageGet: {
        keys: string[];
        global: boolean;
    };
    VKWebAppStorageGetKeys: {
        count: number;
        offset: number;
        global: boolean;
    };
    VKWebAppStorageSet: {};
    VKWebAppTapticImpactOccurred: {
        style: TapticVibrationPowerType;
    };
    VKWebAppTapticNotificationOccurred: {
        type: TapticNotificationType;
    };
    VKWebAppTapticSelectionChanged: {};
    VKWebAppAddToFavorites: {};
    VKWebAppSendPayload: {
        group_id: number;
        payload: any;
    };
};
/**
 * Map of types of request props
 */
export declare type ResponseMethodPropsMap = {
    VKWebAppAddToCommunity: {
        group_id: number;
    };
    VKWebAppAllowMessagesFromGroup: {
        result: true;
    };
    VKWebAppAllowNotifications: {
        enabled: true;
    };
    VKWebAppCallAPIMethod: {
        response: any[];
    };
    VKWebAppGetAuthToken: {
        access_token: string;
        scope: string;
    };
    VKWebAppClose: {};
    VKWebAppOpenApp: {
        result: true;
    };
    VKWebAppDenyNotifications: {
        disabled: true;
    };
    VKWebAppFlashGetInfo: {
        is_available: boolean;
        level: number;
    };
    VKWebAppFlashSetLevel: {
        result: true;
    };
    VKWebAppGetClientVersion: {
        platform: string;
        version: string;
    };
    VKWebAppGetEmail: {
        email: string;
    };
    VKWebAppGetFriends: {
        users: Array<{
            id: number;
            first_name: string;
            last_name: string;
        }>;
    };
    VKWebAppGetGeodata: {
        available: number;
        lat: string;
        long: string;
    };
    VKWebAppGetPersonalCard: PersonalCardData;
    VKWebAppGetPhoneNumber: {
        phone_number: string;
        sign: string;
    };
    VKWebAppGetUserInfo: UserInfo;
    VKWebAppJoinGroup: {
        result: true;
    };
    VKWebAppOpenCodeReader: CodeReaderOutput;
    VKWebAppOpenQR: CodeReaderOutput;
    VKWebAppOpenContacts: SelectedContact;
    VKWebAppOpenPayForm: TransactionResult;
    VKWebAppResizeWindow: {
        width: number;
        height: number;
    };
    VKWebAppScroll: {
        top: number;
        height: number;
    };
    VKWebAppSetLocation: {
        result: true;
    };
    VKWebAppSetViewSettings: {
        result: true;
    };
    VKWebAppShare: {
        post_id: string;
    };
    VKWebAppShowCommunityWidgetPreviewBox: {
        result: true;
    };
    VKWebAppShowImages: {
        result: true;
    };
    VKWebAppShowInviteBox: {};
    VKWebAppShowLeaderBoardBox: {
        success: boolean;
    };
    VKWebAppShowMessageBox: {
        result: true;
    };
    VKWebAppShowOrderBox: {
        status: OrderBoxShowingStatus;
    };
    VKWebAppShowRequestBox: RequestResult;
    VKWebAppShowWallPostBox: {
        post_id: number;
    };
    VKWebAppStorageGet: {
        keys: {
            key: string;
            value: string;
        }[];
    };
    VKWebAppStorageGetKeys: {
        keys: string[];
    };
    VKWebAppStorageSet: {
        key: string;
        value: string;
        global: boolean;
    };
    VKWebAppTapticImpactOccurred: {
        result: true;
    };
    VKWebAppTapticNotificationOccurred: {
        result: true;
    };
    VKWebAppTapticSelectionChanged: {
        result: true;
    };
    VKWebAppAddToFavorites: {
        result: true;
    };
    VKWebAppSendPayload: {
        result: true;
    };
    VKWebAppAudioPaused: {
        position: number;
        type: string;
        id: string;
    };
    VKWebAppAudioStopped: {};
    VKWebAppAudioTrackChanged: {
        type: string;
        id: string;
    };
    VKWebAppAudioUnpaused: {
        type: string;
        id: string;
    };
    VKWebAppInitAds: {
        init: 'true' | 'false';
    };
    VKWebAppLoadAds: {
        load: 'true' | 'false';
    };
    VKWebAppUpdateConfig: UpdateConfigData;
    VKWebAppViewHide: {};
    VKWebAppViewRestore: {};
    VKWebAppGetCommunityToken: {
        access_token: string;
    };
    VKWebAppGetCommunityAuthToken: {
        access_token: string;
    };
    VKWebAppCommunityAccessToken: {
        access_token: string;
    };
    VKWebAppCommunityToken: {
        access_token: string;
    };
};
export declare type RequestMethodName = keyof RequestMethodPropsMap;
export declare type ResponseMethodName = keyof ResponseMethodPropsMap;
/** Type of any method name */
export declare type MethodName = RequestMethodName | ResponseMethodName;
export declare type IOMethodName = RequestMethodName & ResponseMethodName;
/** Getter of request properties of a method */
export declare type RequestProps<M extends RequestMethodName = RequestMethodName> = RequestMethodPropsMap[M] & {
    request_id?: number | string;
};
/** Getter of response properties of a method */
export declare type ResponseProps<M extends ResponseMethodName = ResponseMethodName> = ResponseMethodPropsMap[M] & {
    request_id?: number | string;
};
/** Client error data */
export declare type ErrorDataClientError = {
    error_code: number;
    error_reason: string;
    error_description?: string;
};
/** API error data */
export declare type ErrorDataAPIError = {
    error_code: number;
    error_msg: string;
    request_params: string[];
};
/** Auth error data */
export declare type ErrorDataAuthError = {
    error_code: number;
    error_reason: string;
    error_description?: string[];
};
export declare type ErrorData = {
    error_type: 'client_error';
    error_data: ErrorDataClientError;
    request_id?: number | string;
} | {
    error_type: 'api_error';
    error_data: ErrorDataAPIError;
    request_id?: number | string;
} | {
    error_type: 'auth_error';
    error_data: ErrorDataAuthError;
    request_id?: number | string;
};
export declare type VKConnectErrorEvent<T extends MethodName> = {
    detail: {
        type: T;
        data: ErrorData;
    };
};
export declare type VKConnectSuccessEvent<T extends ResponseMethodName> = {
    detail: {
        type: T;
        data: ResponseProps<T>;
        app_id?: string;
        scheme?: AppearanceSchemeType;
        appearance?: AppearanceType;
    };
};
/**
 * VK Connect event
 */
export declare type VKConnectEvent<T extends ResponseMethodName> = VKConnectErrorEvent<T> | VKConnectSuccessEvent<T>;
/**
 * The type of function that will be subscribed to VK Connect events
 */
export declare type SubscribeHandler = <T extends ResponseMethodName>(event: VKConnectEvent<T>) => void;
/**
 * Type of global object with VK Connect methods in Android app WebView
 */
export declare type AndroidBridge = Record<RequestMethodName, (serializedData: string) => void>;
/**
 * Type of global object with VK Connect methods in iOS app WebView
 */
export declare type IOSBridge = Record<RequestMethodName, {
    postMessage?: (data: any) => void;
}>;
