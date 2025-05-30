const Stack = createNativeStackNavigator();
import React, { useEffect, useState } from "react"; 
import { LogBox } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import Home from './screens/Home'; // Import Home screen
import StartScreen from "./screens/StartScreen";
import MATCHINGSCREEN1 from "./screens/MATCHINGSCREEN1";
import PROFILESCREEN1 from "./screens/PROFILESCREEN1";
import CHATSCREEN1 from "./screens/CHATSCREEN1";
import MENTORSCREEN2 from "./screens/MENTORSCREEN2";
import MENTORSCREEN3 from "./screens/MENTORSCREEN3";
import Welcome from "./screens/Welcome";
import About2 from "./screens/About2";
import MENTORPROFILE from "./screens/MENTORPROFILE";
import About4 from "./screens/About4";
import LoginAccount from "./screens/LoginAccount";
import CreateAccount from "./screens/CreateAccount";
import About1 from "./screens/About1";
import About3 from "./screens/About3";
import ResetMatches from "./screens/ResetMatches"
import MIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { IconRegistry, ApplicationProvider } from "@ui-kitten/components";
import * as eva from "@eva-design/eva";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { initDemo } from "./demo/demo"


const App = () => {

  useEffect(() => {
    // check if the app is in demo mode
    var demoMode = require('./demo/toggleDemoMode.json');
    console.log("Demo Mode Toggled:", demoMode["demoMode"]);
    if (demoMode["demoMode"]) {
      LogBox.ignoreAllLogs();
      initDemo();
    }
  }, []);
  
  
  const [hideSplashScreen, setHideSplashScreen] = React.useState(true);

  const [fontsLoaded, error] = useFonts({
    "Raleway-Regular": require("./assets/fonts/Raleway-Regular.ttf"),
    "Raleway-SemiBold": require("./assets/fonts/Raleway-SemiBold.ttf"),
    "Raleway-Bold": require("./assets/fonts/Raleway-Bold.ttf"),
    "Roboto-Regular": require("./assets/fonts/Roboto-Regular.ttf"),
    "Roboto-Medium": require("./assets/fonts/Roboto-Medium.ttf"),
    "Roboto-Bold": require("./assets/fonts/Roboto-Bold.ttf"),
  });

  function MaterialIcon({ name, style }) {
    const { height, tintColor, ...iconStyle } = StyleSheet.flatten(style);
    return (
      <MIcon name={name} size={height} color={tintColor} style={iconStyle} />
    );
  }

  const IconProvider = (name) => ({
    toReactElement: (props) => MaterialIcon({ name, ...props }),
  });

  function createIconsMap() {
    return new Proxy(
      {},
      {
        get(target, name) {
          return IconProvider(name);
        },
      }
    );
  }
  const MaterialIconsPack = {
    name: "material",
    icons: createIconsMap(),
  };

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <>
      <IconRegistry icons={[MaterialIconsPack]} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <NavigationContainer>
          {hideSplashScreen ? (
            <Stack.Navigator
              initialRouteName="StartScreen"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen
                name="StartScreen"
                component={StartScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Home"
                component={Home}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="MATCHINGSCREEN1"
                component={MATCHINGSCREEN1}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PROFILESCREEN1"
                component={PROFILESCREEN1}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CHATSCREEN1"
                component={CHATSCREEN1}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="MENTORSCREEN2"
                component={MENTORSCREEN2}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="MENTORSCREEN3"
                component={MENTORSCREEN3}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Welcome"
                component={Welcome}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="About2"
                component={About2}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="MENTORPROFILE"
                component={MENTORPROFILE}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="About4"
                component={About4}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="LoginAccount"
                component={LoginAccount}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CreateAccount"
                component={CreateAccount}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="About1"
                component={About1}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="About3"
                component={About3}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ResetMatches"
                component={ResetMatches}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          ) : null}
        </NavigationContainer>
      </ApplicationProvider>
    </>
  );
};
export default App;
