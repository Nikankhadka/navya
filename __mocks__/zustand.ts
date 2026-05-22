const mockStore: Record<string, unknown> = {};

export const create = jest.fn((fn) => {
  const setState = (state: unknown) => {
    Object.assign(mockStore, typeof state === 'function' ? state(mockStore) : state);
  };
  const getState = () => mockStore;

  const store = fn(setState, getState);
  Object.assign(mockStore, store);

  const useStore = jest.fn((selector?: (s: unknown) => unknown) => {
    return selector ? selector(mockStore) : mockStore;
  });

  return useStore;
});
