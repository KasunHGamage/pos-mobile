import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Platform } from 'react-native';
import { colors } from '../theme/colors';

// Types
import { RootStackParamList, MainTabParamList } from './types';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OtpVerifyScreen from '../screens/OtpVerifyScreen';
import POSHomeScreen from '../screens/POSHomeScreen';
import SalesScreen from '../screens/SalesScreen';
import CustomersScreen from '../screens/CustomersScreen';
import CustomerDetailsScreen from '../screens/CustomerDetailsScreen';
import ReturnBillsScreen from '../screens/ReturnBillsScreen';
import CreditSalesReportScreen from '../screens/CreditSalesReportScreen';
import UserBillingScreen from '../screens/UserBillingScreen';
import PaymentDetailsScreen from '../screens/PaymentDetailsScreen';
import BillInventoryHistoryScreen from '../screens/BillInventoryHistoryScreen';
import UserSettingsScreen from '../screens/UserSettingsScreen';
import AboutAppScreen from '../screens/AboutAppScreen';
import AppSettingsScreen from '../screens/AppSettingsScreen';
import InventoryScreen from '../screens/InventoryScreen';
import SalesAnalyticsScreen from '../screens/SalesAnalyticsScreen';
import ReceiptScreen from '../screens/ReceiptScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScannerScreen from '../screens/ScannerScreen';
import DownloadReportScreen from '../screens/DownloadReportScreen';
import InventoryDownloadReportScreen from '../screens/InventoryDownloadReportScreen';
import CategoryAnalyticsScreen from '../screens/CategoryAnalyticsScreen';
import ProductAnalyticsScreen from '../screens/ProductAnalyticsScreen';
import ShopProfileScreen from '../screens/ShopProfileScreen';
import SubAdminsScreen from '../screens/SubAdminsScreen';
import SetPrivilegesScreen from '../screens/SetPrivilegesScreen';
import SuppliersScreen from '../screens/SuppliersScreen';
import SupplierProductsScreen from '../screens/SupplierProductsScreen';
import SupplierPurchaseOrdersScreen from '../screens/SupplierPurchaseOrdersScreen';
import CreatePurchaseOrderScreen from '../screens/CreatePurchaseOrderScreen';
import ProductListScreen from '../screens/ProductListScreen';
import SupplierGRNScreen from '../screens/SupplierGRNScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();


function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help';

          if (route.name === 'Shop') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Invoice') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Inventory') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }

          if (route.name === 'Scanner') {
            return (
              <View style={{
                width: 76,
                height: 76,
                borderRadius: 38,
                backgroundColor: colors.surface,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 5,
                marginBottom: Platform.OS === 'ios' ? 48 : 36, // Shift up even more
              }}>
                <Ionicons name="barcode-outline" size={40} color={colors.primary} />
              </View>
            );
          }

          return (
            <View style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: focused ? -2 : 0 // slight upward nudge
            }}>
              <Ionicons
                name={iconName}
                size={focused ? size + 6 : size}
                color={color}
              />
            </View>
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, marginTop: 2, fontWeight: '500' },
        headerShown: false,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          height: Platform.OS === 'ios' ? 100 : 65,
          paddingBottom: Platform.OS === 'ios' ? 36 : 8,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen name="Shop" component={SalesScreen} />
      <Tab.Screen name="Invoice" component={POSHomeScreen} />
      <Tab.Screen name="Scanner" component={ScannerScreen} options={{ tabBarLabel: '' }} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Receipt" component={ReceiptScreen} />
        <Stack.Screen name="Customers" component={CustomersScreen} />
        <Stack.Screen name="CustomerDetails" component={CustomerDetailsScreen} />
        <Stack.Screen name="ReturnBills" component={ReturnBillsScreen} />
        <Stack.Screen name="CreditSalesReport" component={CreditSalesReportScreen} />
        <Stack.Screen name="UserBilling" component={UserBillingScreen} />
        <Stack.Screen name="PaymentDetails" component={PaymentDetailsScreen} />
        <Stack.Screen name="BillInventoryHistory" component={BillInventoryHistoryScreen} />
        <Stack.Screen name="UserSettings" component={UserSettingsScreen} />
        <Stack.Screen name="AboutApp" component={AboutAppScreen} />
        <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
        <Stack.Screen name="SalesAnalytics" component={SalesAnalyticsScreen} />
        <Stack.Screen name="DownloadReport" component={DownloadReportScreen} />
        <Stack.Screen name="InventoryDownloadReport" component={InventoryDownloadReportScreen} />
        <Stack.Screen name="CategoryAnalytics" component={CategoryAnalyticsScreen} />
        <Stack.Screen name="ProductAnalytics" component={ProductAnalyticsScreen} />
        <Stack.Screen name="ShopProfile" component={ShopProfileScreen} />
        <Stack.Screen name="SubAdmins" component={SubAdminsScreen} />
        <Stack.Screen name="SetPrivileges" component={SetPrivilegesScreen} />
        <Stack.Screen name="Suppliers" component={SuppliersScreen} />
        <Stack.Screen name="SupplierProducts" component={SupplierProductsScreen} />
        <Stack.Screen name="SupplierPurchaseOrders" component={SupplierPurchaseOrdersScreen} />
        <Stack.Screen name="CreatePurchaseOrder" component={CreatePurchaseOrderScreen} />
        <Stack.Screen name="ProductList" component={ProductListScreen} />
        <Stack.Screen name="SupplierGRN" component={SupplierGRNScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
