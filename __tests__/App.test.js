test('1+1=2', () => {
    expect(1 + 1).toBe(2);
});
/*
const ActionSheetIOS = require('./Libraries/ActionSheetIOS/ActionSheetIOS').default;

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
      ...actualNav,
      NavigationContainer: jest.fn(({ children }) => children),
    };
  });
  

jest.mock('@react-navigation/native-stack', () => {
    return {
        createNativeStackNavigator: jest.fn(() => {
            return {
                Navigator: jest.fn(({ children }) => children),
                Screen: jest.fn(() => null),
            };
        }),
    };
});

jest.mock('expo-font', () => {
    return {
        useFonts: () => [true, null],
    };
});

jest.mock('@ui-kitten/components', () => {
    return {
        IconRegistry: jest.fn(() => null),
        ApplicationProvider: jest.fn(({ children }) => children),
    };
});
*/

