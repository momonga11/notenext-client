import { rejectError } from './error';

const mockFn = (wrapper, mockError) => {
  if (!mockError) {
    return Promise.resolve();
  }
  return rejectError(wrapper);
};

export default mockFn;
