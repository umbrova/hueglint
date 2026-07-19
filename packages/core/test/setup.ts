// jsdom does not implement ResizeObserver. This stub exists purely so
// constructing a Heatmap doesn't throw in the test environment — none
// of our tests rely on it actually firing; aggregation is exercised
// instead by mocking clientWidth/clientHeight before calling load(),
// the same pattern already used throughout this test suite.
if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  globalThis.ResizeObserver = ResizeObserverStub;
}