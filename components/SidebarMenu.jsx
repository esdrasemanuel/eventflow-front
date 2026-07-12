import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView } from 'react-native';

export default function SidebarMenu({ visible, onClose }) {
  return (
    <Modal
      animationType="fade" // for Smooths the dark backdrop entry
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Dark semi-transparent overlay backdrop */}
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        
        {/* Sidebar container is sliding from the left */}
        <TouchableOpacity style={styles.sidebarContainer} activeOpacity={1}>
          <SafeAreaView style={styles.safeArea}>
            
            {/* Sidebar Top Header */}
            <View style={styles.header}>
              <Text style={styles.menuTitle}>M&E flow</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Main Navigation Menu Items */}
            <View style={styles.menuItems}>
              <TouchableOpacity style={styles.menuItem} onPress={onClose}>
                <Text style={styles.menuItemText}>🏠 Home</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={onClose}>
                <Text style={styles.menuItemText}>📅 Calendar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={onClose}>
                <Text style={styles.menuItemText}>💬 Messages</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={onClose}>
                <Text style={styles.menuItemText}>👤 Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Sidebar Footer for logout */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.logoutButton} onPress={onClose}>
                <Text style={styles.logoutText}>🚪 Logout</Text>
              </TouchableOpacity>
            </View>

          </SafeAreaView>
        </TouchableOpacity>

      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flexDirection: 'row',
  },
  sidebarContainer: {
    width: '75%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 10,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#382109',
  },
  closeButton: {
    fontSize: 20,
    color: '#757575',
    padding: 5,
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C4043',
  },
  footer: {
    paddingBottom: 20,
  },
  logoutButton: {
    paddingVertical: 15,
  },
  logoutText: {
    fontSize: 16,
    color: '#D93025',
    fontWeight: '600',
  },
});