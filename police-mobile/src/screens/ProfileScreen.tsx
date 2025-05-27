import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Avatar, List, Switch, Button, Surface, Divider, useTheme, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const theme = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const userInfo = {
    name: 'John Doe',
    role: 'Police Officer',
    badgeNumber: 'PO-12345',
    email: 'john.doe@police.gov',
    phone: '+1 234 567 8900',
    department: 'Traffic Division',
  };

  return (
    <View style={styles.container}>
      <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]} elevation={2}>
        <Text variant="headlineMedium" style={styles.headerText}>Profile</Text>
        <View style={styles.headerRight}>
          <Text variant="titleLarge" style={styles.appTitle}>RAISE</Text>
          <IconButton
            icon="bell"
            size={24}
            onPress={() => {}}
            style={styles.notificationButton}
            iconColor="white"
          />
        </View>
      </Surface>

      <ScrollView style={styles.scrollView}>
        <Surface style={[styles.profileCard, { backgroundColor: theme.colors.primary }]} elevation={2}>
          <View style={styles.profileHeader}>
            <Avatar.Text
              size={80}
              label={userInfo.name.split(' ').map(n => n[0]).join('')}
              style={[styles.avatar, { backgroundColor: 'white' }]}
              color={theme.colors.primary}
            />
            <View style={styles.profileInfo}>
              <Text variant="headlineSmall" style={styles.name}>
                {userInfo.name}
              </Text>
              <Text variant="titleMedium" style={styles.role}>
                {userInfo.role}
              </Text>
              <Text variant="bodyMedium" style={styles.badge}>
                Badge: {userInfo.badgeNumber}
              </Text>
            </View>
          </View>
        </Surface>

        <Surface style={styles.section} elevation={1}>
          <List.Section>
            <List.Subheader style={styles.sectionTitle}>Contact Information</List.Subheader>
            <List.Item
              title="Email"
              description={userInfo.email}
              left={props => <List.Icon {...props} icon="email" color={theme.colors.primary} />}
              style={styles.listItem}
            />
            <Divider />
            <List.Item
              title="Phone"
              description={userInfo.phone}
              left={props => <List.Icon {...props} icon="phone" color={theme.colors.primary} />}
              style={styles.listItem}
            />
            <Divider />
            <List.Item
              title="Department"
              description={userInfo.department}
              left={props => <List.Icon {...props} icon="office-building" color={theme.colors.primary} />}
              style={styles.listItem}
            />
          </List.Section>
        </Surface>

        <Surface style={styles.section} elevation={1}>
          <List.Section>
            <List.Subheader style={styles.sectionTitle}>Preferences</List.Subheader>
            <List.Item
              title="Notifications"
              description="Receive updates about your reports"
              left={props => <List.Icon {...props} icon="bell" color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  color={theme.colors.primary}
                />
              )}
              style={styles.listItem}
            />
            <Divider />
            <List.Item
              title="Dark Mode"
              description="Switch between light and dark theme"
              left={props => <List.Icon {...props} icon="theme-light-dark" color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                  color={theme.colors.primary}
                />
              )}
              style={styles.listItem}
            />
          </List.Section>
        </Surface>

        <Surface style={styles.section} elevation={1}>
          <List.Section>
            <List.Subheader style={styles.sectionTitle}>Account</List.Subheader>
            <List.Item
              title="Change Password"
              left={props => <List.Icon {...props} icon="lock" color={theme.colors.primary} />}
              onPress={() => {}}
              style={styles.listItem}
            />
            <Divider />
            <List.Item
              title="Privacy Settings"
              left={props => <List.Icon {...props} icon="shield-account" color={theme.colors.primary} />}
              onPress={() => {}}
              style={styles.listItem}
            />
            <Divider />
            <List.Item
              title="Help & Support"
              left={props => <List.Icon {...props} icon="help-circle" color={theme.colors.primary} />}
              onPress={() => {}}
              style={styles.listItem}
            />
          </List.Section>
        </Surface>

        <Button
          mode="outlined"
          icon="logout"
          onPress={() => {}}
          style={styles.logoutButton}
          textColor={theme.colors.error}
          contentStyle={styles.logoutButtonContent}
        >
          Log Out
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  appTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 8,
  },
  notificationButton: {
    margin: 0,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    backgroundColor: 'white',
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  name: {
    color: 'white',
    fontWeight: 'bold',
  },
  role: {
    color: 'white',
    opacity: 0.9,
  },
  badge: {
    color: 'white',
    opacity: 0.8,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  listItem: {
    paddingVertical: 8,
  },
  logoutButton: {
    margin: 16,
    marginBottom: 32,
    borderColor: '#f44336',
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
});

export default ProfileScreen; 