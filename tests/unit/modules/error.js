export class ErrorStoreMock {
  constructor() {
    this.message = '';
    this.status = '';
  }

  getMock() {
    return {
      namespaced: true,
      state: { message: this.message, status: this.status },
    };
  }
}

export const rejectError = wrapper => {
  wrapper.vm.$store.state.error.message = 'test-error-message';
  wrapper.vm.$store.state.error.status = 'test-error-status';
  return Promise.reject(new Error('fail'));
};
