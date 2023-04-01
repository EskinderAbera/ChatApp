import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import ChatScreen from "../src/screens/ChatScreen";
import { createStackNavigator } from "@react-navigation/stack";
import MainTabNavigator from "./MainTabNavigator";
import ContactsScreen from "../src/screens/ContactsScreen";

const Stack = createStackNavigator();

const Navigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ headerStyle: { backgroundColor: "whitesmoke" } }}
        />
        <Stack.Screen
          name="Contacts"
          component={ContactsScreen}
          options={{ headerStyle: { backgroundColor: "whitesmoke" } }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
