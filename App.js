// This is the main entry point for the React Native application.

// Core & React Navigation
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

// UI Kitten (Eva), Icon Pack, Expo Fonts
import { IconRegistry, ApplicationProvider } from "@ui-kitten/components";
import * as eva from "@eva-design/eva";
import MIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts } from "expo-font";

// Screens
import AppEntry from "./screens/EntryPoint/AppEntry";
import Home from "./screens/EntryPoint/Home";
import MentorMatching from "./screens/MentorMatching/MentorMatching";
import UserProfile from "./screens/Profiles/UserProfile";
import EditProfile from "./screens/Profiles/EditProfile";
import DiscoverConnections from "./screens/DirectMessaging/DiscoverConnections";
import MenteeMentorSelector from "./screens/EntryPoint/MenteeMentorSelector";
import About1 from "./screens/Profiles/About1";
import About2 from "./screens/Profiles/About2";
import About3 from "./screens/Profiles/About3";
import About4 from "./screens/Profiles/About4";

import Login from "./screens/EntryPoint/Login";
import SignUp from "./screens/EntryPoint/SignUp";

import MessageInbox from "./screens/DirectMessaging/MessageInbox";
import Conversation from "./screens/DirectMessaging/Conversation";

import ForumsHome from "./screens/Forums/ForumsHome";
import ThreadList from "./screens/Forums/ThreadList";
import ThreadDetail from "./screens/Forums/ThreadDetail";
import NewThread from "./screens/Forums/NewThread";


// Notification Service
import notificationService from "./services/notificationService";

// IMPORTANT: Define the stack AFTER importing the factory.
const Stack = createNativeStackNavigator();

// Custom MaterialCommunityIcons adapter for UI Kitten. UI Kitten expects an icon pack with a `toReactElement` factory.
function MaterialIcon({ name, style }) {
  const { height, tintColor, ...iconStyle } = StyleSheet.flatten(style || {});
  return <MIcon name={name} size={height} color={tintColor} style={iconStyle} />;
}

const IconProvider = (name) => ({
  toReactElement: (props) => MaterialIcon({ name, ...props }),
});

// Build a proxy map so any icon name resolves to our provider.
function createIconsMap() {
  return new Proxy(
    {},
    {
      get(_target, name) {
        return IconProvider(name);
      },
    }
  );
}

const MaterialIconsPack = {
  name: "material",
  icons: createIconsMap(),
};

const App = () => {
  useEffect(() => {
    // Initialize notification service
    notificationService.initialize().then((token) => {
      if (token) {
        console.log('Notification service initialized successfully');
        notificationService.setupNotificationListeners();
      } else {
        console.log('Notification service initialization failed or skipped');
      }
    }).catch((error) => {
      console.error('Error initializing notification service:', error);
    });
    
    // Cleanup on unmount
    return () => {
      notificationService.cleanup();
    };
  }, []);

  // NOTE: this flag gates the navigator tree (kept as-is to not change behavior)
  const [hideSplashScreen] = React.useState(true);

  // Preload custom fonts used throughout the app
  const [fontsLoaded, error] = useFonts({
    "Raleway-Regular": require("./assets/fonts/Raleway-Regular.ttf"),
    "Raleway-SemiBold": require("./assets/fonts/Raleway-SemiBold.ttf"),
    "Raleway-Bold": require("./assets/fonts/Raleway-Bold.ttf"),
    "Roboto-Regular": require("./assets/fonts/Roboto-Regular.ttf"),
    "Roboto-Medium": require("./assets/fonts/Roboto-Medium.ttf"),
    "Roboto-Bold": require("./assets/fonts/Roboto-Bold.ttf"),
  });

  // Avoid flashing unstyled text; render nothing until fonts are ready
  if (!fontsLoaded && !error) return null;

  return (
    <SafeAreaProvider>
      {/* Register our MaterialCommunityIcons adapter for UI Kitten */}
      <IconRegistry icons={[MaterialIconsPack]} />

      {/* Provide Eva design system theme */}
      <ApplicationProvider {...eva} theme={eva.light}>

        {/* React Stack Navigator */}
        <NavigationContainer>
          {hideSplashScreen ? (
            <Stack.Navigator
              initialRouteName="AppEntry"
              screenOptions={{ headerShown: false }}
            >
              {/* Entry & Core */}
              <Stack.Screen name="AppEntry" component={AppEntry} />
              <Stack.Screen name="Home" component={Home} />

              {/* Auth */}
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="SignUp" component={SignUp} />

              {/* Profiles & Matching */}
              <Stack.Screen name="MentorMatching" component={MentorMatching} />
              <Stack.Screen name="UserProfile" component={UserProfile} />
              <Stack.Screen name="EditProfile" component={EditProfile} />
              <Stack.Screen name="MenteeMentorSelector" component={MenteeMentorSelector} />

              {/* Discovery & Chat */}
              <Stack.Screen name="DiscoverConnections" component={DiscoverConnections} />

              {/* About / Onboarding info */}
              <Stack.Screen name="About1" component={About1} />
              <Stack.Screen name="About2" component={About2} />
              <Stack.Screen name="About3" component={About3} />
              <Stack.Screen name="About4" component={About4} />

              {/* Messaging */}
              <Stack.Screen
                name="MessageInbox"
                component={MessageInbox}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Conversation"
                component={Conversation}
                options={{ headerShown: false }}
              />

              {/* Forums */}
              <Stack.Screen
                name="ForumsHome"
                component={ForumsHome}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ThreadList"
                component={ThreadList}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ThreadDetail"
                component={ThreadDetail}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="NewThread"
                component={NewThread}
                options={{ headerShown: true, title: "New Thread" }}
              />
            </Stack.Navigator>
          ) : null}
        </NavigationContainer>
      </ApplicationProvider>
    </SafeAreaProvider>
  );
};

export default App;
