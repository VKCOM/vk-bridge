import connectEsm, { applyMiddleware as applyMiddlewareEsm } from '../../';
const { applyMiddleware: applyMiddlewareUmd, ...connectUmd } = require('../../dist/index.umd');
const { applyMiddleware: applyMiddlewareCmj, ...connectCmj } = require('../../dist/index');

test('Valid esm export', () => {
  expect(typeof connectEsm.send).toBe('function');
  expect(typeof connectEsm.subscribe).toBe('function');
  expect(typeof connectEsm.unsubscribe).toBe('function');
  expect(typeof connectEsm.supports).toBe('function');
  expect(typeof connectEsm.isWebView).toBe('function');

  expect(typeof applyMiddlewareEsm).toBe('function');
  expect(typeof applyMiddlewareEsm()(connectEsm).send).toBe('function');
});

test('Valid umd export', () => {
  expect(typeof connectUmd.send).toBe('function');
  expect(typeof connectUmd.subscribe).toBe('function');
  expect(typeof connectUmd.unsubscribe).toBe('function');
  expect(typeof connectUmd.supports).toBe('function');
  expect(typeof connectUmd.isWebView).toBe('function');

  expect(typeof applyMiddlewareUmd).toBe('function');
  expect(typeof applyMiddlewareUmd()(connectUmd).send).toBe('function');
});

test('Valid commonjs export', () => {
  expect(typeof connectCmj.send).toBe('function');
  expect(typeof connectCmj.subscribe).toBe('function');
  expect(typeof connectCmj.unsubscribe).toBe('function');
  expect(typeof connectCmj.supports).toBe('function');
  expect(typeof connectCmj.isWebView).toBe('function');

  expect(typeof applyMiddlewareCmj).toBe('function');
  expect(typeof applyMiddlewareCmj()(connectCmj).send).toBe('function');
});
