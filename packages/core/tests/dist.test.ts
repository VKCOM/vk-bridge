/**
 * ⛔️ YOU SHOULD BUILD THE PACKAGE BEFORE START THIS TEST
 */
import bridgeEsm, { applyMiddleware as applyMiddlewareEsm } from '@vkontakte/vk-bridge';
const { applyMiddleware: applyMiddlewareUmd, default: bridgeUmd } = require('../dist/index.umd');
const { applyMiddleware: applyMiddlewareCmj, default: bridgeCmj } = require('../dist/index');

test('Valid esm export', () => {
  expect(typeof bridgeEsm.send).toBe('function');
  expect(typeof bridgeEsm.subscribe).toBe('function');
  expect(typeof bridgeEsm.unsubscribe).toBe('function');
  expect(typeof bridgeEsm.supports).toBe('function');
  expect(typeof bridgeEsm.isWebView).toBe('function');

  expect(typeof applyMiddlewareEsm).toBe('function');
  expect(typeof applyMiddlewareEsm()(bridgeEsm).send).toBe('function');
});

test('Valid umd export', () => {
  expect(typeof bridgeUmd.send).toBe('function');
  expect(typeof bridgeUmd.subscribe).toBe('function');
  expect(typeof bridgeUmd.unsubscribe).toBe('function');
  expect(typeof bridgeUmd.supports).toBe('function');
  expect(typeof bridgeUmd.isWebView).toBe('function');

  expect(typeof applyMiddlewareUmd).toBe('function');
  expect(typeof applyMiddlewareUmd()(bridgeUmd).send).toBe('function');
});

test('Valid commonjs export', () => {
  expect(typeof bridgeCmj.send).toBe('function');
  expect(typeof bridgeCmj.subscribe).toBe('function');
  expect(typeof bridgeCmj.unsubscribe).toBe('function');
  expect(typeof bridgeCmj.supports).toBe('function');
  expect(typeof bridgeCmj.isWebView).toBe('function');

  expect(typeof applyMiddlewareCmj).toBe('function');
  expect(typeof applyMiddlewareCmj()(bridgeCmj).send).toBe('function');
});
