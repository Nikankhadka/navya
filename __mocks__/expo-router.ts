export const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
}));

export const useLocalSearchParams = jest.fn(() => ({}));

export const useSegments = jest.fn(() => []);

export const Stack = {
  Screen: jest.fn(({ children }) => children),
};

export const Link = jest.fn(({ children }) => children);

export const Redirect = jest.fn(() => null);
