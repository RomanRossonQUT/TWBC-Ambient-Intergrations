import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Navbar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Function to determine if the current screen is active
  const isActive = (screenName) => route.name === screenName;
  const {uid, pid, type} = route.params;

  if (type == "Mentor") {
    return (
      <View style={styles.navbar}>
        <Pressable
          style={[styles.navButton, isActive('Home') && styles.activeButton]}
          onPress={() => navigation.navigate('Home', {uid, pid, type})} 
        >
          <Icon name="home" size={24} color={isActive('Home') ? '#ffb6c1' : '#fff'} />
        </Pressable>
        <Pressable
          style={[styles.navButton, isActive('MENTORSCREEN3') && styles.activeButton]}
          onPress={() => navigation.navigate('MENTORSCREEN3', {uid, pid, type})}
        >
          <Icon name="comments" size={24} color={isActive('MENTORSCREEN3') ? '#ffb6c1' : '#fff'} />
        </Pressable>
        <Pressable
          style={[styles.navButton, isActive('PROFILESCREEN1') && styles.activeButton]}
          onPress={() => navigation.navigate('PROFILESCREEN1', {uid, pid, type})}
        >
          <Icon name="user" size={24} color={isActive('PROFILESCREEN1') ? '#ffb6c1' : '#fff'} />
        </Pressable>
      </View>
    );
  } else {
    return (
      <View style={styles.navbar}>
        <Pressable
          style={[styles.navButton, isActive('Home') && styles.activeButton]}
          onPress={() => navigation.navigate('Home', {uid, pid, type})}
        >
          <Icon name="home" size={24} color={isActive('Home') ? '#ffb6c1' : '#fff'} />
        </Pressable>
        <Pressable
          style={[styles.navButton, isActive('MATCHINGSCREEN1') && styles.activeButton]}
          onPress={() => navigation.navigate('MATCHINGSCREEN1', {uid, pid, type})}
        >
          <Icon name="users" size={24} color={isActive('MATCHINGSCREEN1') ? '#ffb6c1' : '#fff'} />
        </Pressable>
        <Pressable
          style={[styles.navButton, isActive('MessageInbox') && styles.activeButton]}
          onPress={() => navigation.navigate('MessageInbox', { uid, pid, type })}
        >
          <Icon name="comments" size={24} color={isActive('MessageInbox') ? '#ffb6c1' : '#fff'} />
        </Pressable>
        <Pressable
          style={[styles.navButton, isActive('PROFILESCREEN1') && styles.activeButton]}
          onPress={() => navigation.navigate('PROFILESCREEN1', {uid, pid, type})}
        >
          <Icon name="user" size={24} color={isActive('PROFILESCREEN1') ? '#ffb6c1' : '#fff'} />
        </Pressable>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#ed469a',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navButton: {
    padding: 10,
  },
  activeButton: {
    backgroundColor: '#ffe4e1',
    borderRadius: 10,
  },
});

export default Navbar;
