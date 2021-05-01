export default class HttpStoreMock {
  static getMock() {
    return {
      namespaced: true,
      state: { isLoading: false },
    };
  }
}
