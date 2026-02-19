import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';

// Icons
import { NetokLogoIcon, ShieldIcon, ToolsIcon, SettingsIcon } from '../components/icons/NavigationIcons';

// Screens
import { StatusScreen } from '../screens/StatusScreen';
import { DiagnosticsScreen } from '../screens/DiagnosticsScreen';
import { ToolsScreen } from '../screens/ToolsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { DnsProvidersScreen } from '../screens/DnsProvidersScreen';
import { SpeedTestScreen } from '../screens/SpeedTestScreen';
import { DeviceScanScreen } from '../screens/DeviceScanScreen';
import { WiFiSecurityScreen } from '../screens/WiFiSecurityScreen';
import { ThemeSettingsScreen } from '../screens/ThemeSettingsScreen';
import { LanguageSettingsScreen } from '../screens/LanguageSettingsScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { NodeDetailScreen } from '../screens/NodeDetailScreen';
import { useDiagnosticsStore } from '../stores/diagnosticsStore';

// Stack param lists
export type HomeStackParamList = {
  HomeMain: undefined;
  Diagnostics: undefined;
  NodeDetail: { nodeId: string };
  DnsProviders: undefined;
  WiFiSecurity: undefined;
};

export type SecurityStackParamList = {
  SecurityMain: undefined;
  DnsProviders: undefined;
  WiFiSecurity: undefined;
};

export type ToolsStackParamList = {
  ToolsMain: undefined;
  Diagnostics: undefined;
  NodeDetail: { nodeId: string };
  SpeedTest: undefined;
  DeviceScan: undefined;
  WiFiSecurity: undefined;
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  ThemeSettings: undefined;
  LanguageSettings: undefined;
  About: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SecurityStack = createNativeStackNavigator<SecurityStackParamList>();
const ToolsStack = createNativeStackNavigator<ToolsStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const Tab = createBottomTabNavigator();

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain">
        {({ navigation }) => (
          <StatusScreen
            onOpenDiagnostics={() => navigation.navigate('Diagnostics')}
            onNavigateToDnsProviders={() => navigation.navigate('DnsProviders')}
            onNavigateToWifiSecurity={() => navigation.navigate('WiFiSecurity')}
          />
        )}
      </HomeStack.Screen>
      <HomeStack.Screen name="Diagnostics">
        {({ navigation }) => (
          <DiagnosticsScreen
            onBack={() => navigation.goBack()}
            onNodePress={(nodeId) => navigation.navigate('NodeDetail', { nodeId })}
          />
        )}
      </HomeStack.Screen>
      <HomeStack.Screen name="NodeDetail">
        {({ navigation, route }) => {
          const result = useDiagnosticsStore.getState().getRawResult(route.params.nodeId);
          return result ? (
            <NodeDetailScreen
              nodeId={route.params.nodeId}
              result={result}
              onBack={() => navigation.goBack()}
            />
          ) : null;
        }}
      </HomeStack.Screen>
      <HomeStack.Screen name="DnsProviders">
        {({ navigation }) => (
          <DnsProvidersScreen onBack={() => navigation.goBack()} />
        )}
      </HomeStack.Screen>
      <HomeStack.Screen name="WiFiSecurity">
        {({ navigation }) => (
          <WiFiSecurityScreen onBack={() => navigation.goBack()} />
        )}
      </HomeStack.Screen>
    </HomeStack.Navigator>
  );
}

function SecurityNavigator() {
  const tabNav = useNavigation<any>();
  return (
    <SecurityStack.Navigator screenOptions={{ headerShown: false }}>
      <SecurityStack.Screen name="SecurityMain">
        {() => (
          <DnsProvidersScreen onBack={() => tabNav.navigate('Home')} />
        )}
      </SecurityStack.Screen>
      <SecurityStack.Screen name="WiFiSecurity">
        {({ navigation }) => (
          <WiFiSecurityScreen onBack={() => navigation.goBack()} />
        )}
      </SecurityStack.Screen>
    </SecurityStack.Navigator>
  );
}

function ToolsNavigator() {
  const tabNav = useNavigation<any>();
  return (
    <ToolsStack.Navigator screenOptions={{ headerShown: false }}>
      <ToolsStack.Screen name="ToolsMain">
        {({ navigation }) => (
          <ToolsScreen
            onBack={() => tabNav.navigate('Home')}
            onOpenDiagnostics={() => navigation.navigate('Diagnostics')}
            onOpenSpeedTest={() => navigation.navigate('SpeedTest')}
            onOpenDeviceScan={() => navigation.navigate('DeviceScan')}
            onOpenWifiSecurity={() => navigation.navigate('WiFiSecurity')}
          />
        )}
      </ToolsStack.Screen>
      <ToolsStack.Screen name="Diagnostics">
        {({ navigation }) => (
          <DiagnosticsScreen
            onBack={() => navigation.goBack()}
            onNodePress={(nodeId) => navigation.navigate('NodeDetail', { nodeId })}
          />
        )}
      </ToolsStack.Screen>
      <ToolsStack.Screen name="NodeDetail">
        {({ navigation, route }) => {
          const result = useDiagnosticsStore.getState().getRawResult(route.params.nodeId);
          return result ? (
            <NodeDetailScreen
              nodeId={route.params.nodeId}
              result={result}
              onBack={() => navigation.goBack()}
            />
          ) : null;
        }}
      </ToolsStack.Screen>
      <ToolsStack.Screen name="SpeedTest">
        {({ navigation }) => (
          <SpeedTestScreen onBack={() => navigation.goBack()} />
        )}
      </ToolsStack.Screen>
      <ToolsStack.Screen name="DeviceScan">
        {({ navigation }) => (
          <DeviceScanScreen onBack={() => navigation.goBack()} />
        )}
      </ToolsStack.Screen>
      <ToolsStack.Screen name="WiFiSecurity">
        {({ navigation }) => (
          <WiFiSecurityScreen onBack={() => navigation.goBack()} />
        )}
      </ToolsStack.Screen>
    </ToolsStack.Navigator>
  );
}

function SettingsNavigator() {
  const tabNav = useNavigation<any>();
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsMain">
        {({ navigation }) => (
          <SettingsScreen
            onBack={() => tabNav.navigate('Home')}
            onNavigateToTheme={() => navigation.navigate('ThemeSettings')}
            onNavigateToLanguage={() => navigation.navigate('LanguageSettings')}
            onNavigateToAbout={() => navigation.navigate('About')}
          />
        )}
      </SettingsStack.Screen>
      <SettingsStack.Screen name="ThemeSettings">
        {({ navigation }) => (
          <ThemeSettingsScreen onBack={() => navigation.goBack()} />
        )}
      </SettingsStack.Screen>
      <SettingsStack.Screen name="LanguageSettings">
        {({ navigation }) => (
          <LanguageSettingsScreen onBack={() => navigation.goBack()} />
        )}
      </SettingsStack.Screen>
      <SettingsStack.Screen name="About">
        {({ navigation }) => (
          <AboutScreen onBack={() => navigation.goBack()} />
        )}
      </SettingsStack.Screen>
    </SettingsStack.Navigator>
  );
}

export function RootNavigator() {
  const { isDark, themeColors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const navTheme = isDark ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: themeColors.background,
      card: themeColors.background,
      border: themeColors.border,
      primary: themeColors.primary,
      text: themeColors.foreground,
    },
  } : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: themeColors.background,
      card: themeColors.background,
      border: themeColors.border,
      primary: themeColors.primary,
      text: themeColors.foreground,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: themeColors.foreground,
          tabBarInactiveTintColor: themeColors.mutedForeground,
          tabBarStyle: {
            backgroundColor: themeColors.background,
            borderTopWidth: 0,
            elevation: 0,
            paddingTop: 8,
            paddingBottom: insets.bottom + 12,
            height: 60 + insets.bottom + 12,
          },
          tabBarLabelStyle: {
            fontSize: 13,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeNavigator}
          options={{
            tabBarLabel: 'Netok',
            tabBarIcon: ({ color }) => <NetokLogoIcon size={24} color={color} />,
          }}
        />
        <Tab.Screen
          name="Security"
          component={SecurityNavigator}
          options={{
            tabBarLabel: t('protection.title'),
            tabBarIcon: ({ color }) => <ShieldIcon size={24} color={color} />,
          }}
        />
        <Tab.Screen
          name="Tools"
          component={ToolsNavigator}
          options={{
            tabBarLabel: t('settings.tabs.tools'),
            tabBarIcon: ({ color }) => <ToolsIcon size={24} color={color} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsNavigator}
          options={{
            tabBarLabel: t('settings.title'),
            tabBarIcon: ({ color }) => <SettingsIcon size={24} color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
