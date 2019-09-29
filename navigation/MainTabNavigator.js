import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import LinksScreen from '../screens/LinksScreen';


const config = Platform.select({
  web: { headerMode: 'screen' },
  default: {},
});

const LinksStack = createStackNavigator(
  {
    Links: LinksScreen,
  },
  config
);

LinksStack.navigationOptions = {
  tabBarLabel: ' ',

};

LinksStack.path = '';


const tabNavigator = createBottomTabNavigator({
  LinksStack
});

tabNavigator.path = '';

export default tabNavigator;
