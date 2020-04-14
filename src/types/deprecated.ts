import {
  AnyRequestMethodName,
  AnyReceiveMethodName,
  AnyRequestMethodNameWithProps,
  AnyRequestMethodNameWithoutProps,
  AnyMethodName,
  AnyIOMethodName,
  AnyRequestOnlyMethodName,
  AnyReceiveOnlyMethodName,
} from './bridge';
import { CommunityWidgetType } from './data';

/**
 * Name of a method that can be sent.
 * @alias AnyRequestMethodName
 * @deprecated
 */
export type RequestMethodName = AnyRequestMethodName;

/**
 * Name of a method that can be received.
 * @alias AnyReceiveMethodName
 * @deprecated
 */
export type ReceiveMethodName = AnyReceiveMethodName;

/**
 * Name of a method that can be only sent.
 * @alias AnyRequestOnlyMethodName
 * @deprecated
 */
export type RequestOnlyMethodName = AnyRequestOnlyMethodName;

/**
 * Name of a method that can be only received.
 * @alias AnyReceiveOnlyMethodName
 * @deprecated
 */
export type ReceiveOnlyMethodName = AnyReceiveOnlyMethodName;

/**
 * Name of a method which contains properties
 * @alias AnyRequestMethodNameWithProps
 * @deprecated
 */
export type RequestMethodNameWithProps = AnyRequestMethodNameWithProps;

/**
 * Name of a method which doesn't contain properties
 * @alias AnyRequestMethodNameWithoutProps
 * @deprecated
 */
export type RequestMethodNameWithoutProps = AnyRequestMethodNameWithoutProps;

/**
 * Type of any method name.
 * @alias AnyMethodName
 * @deprecated
 */
export type MethodName = AnyMethodName;

/**
 * The name of the method that can be both sent and received.
 * @alias AnyIOMethodName
 * @deprecated
 */
export type IOMethodName = AnyIOMethodName;

/**
 * Community widget type
 * @alias CommunityWidgetType
 * @deprecated
 */
export type WidgetType = CommunityWidgetType;
