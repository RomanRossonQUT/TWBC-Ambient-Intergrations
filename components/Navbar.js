import { View, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

const Navbar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  // Safe params so we don't crash if undefined
  const { uid, pid, type } = route.params ?? {};
  const isActive = (screenName) => route.name === screenName;

  if (type === "Mentor") {
    // Mentor: Home, MentorScreen3, MessageInbox, ForumsHome, Profile
    return (
      <View style={[styles.navbar, { paddingBottom: insets.bottom - 10 }]}>
        <Pressable
          style={[styles.navButton, isActive('Home') && styles.activeButton]}
          onPress={() => navigation.navigate('Home', { uid, pid, type })}
        >
          <Icon name="home" size={24} color={isActive('Home') ? '#ffb6c1' : '#fff'} />
        </Pressable>

        <Pressable
          style={[styles.navButton, isActive('MentorMatching') && styles.activeButton]}
          onPress={() => navigation.navigate('MentorMatching', { uid, pid, type })}
        >
          <Icon name="users" size={24} color={isActive('MentorMatching') ? '#ffb6c1' : '#fff'} />
        </Pressable>

        {/* Direct Messages (kept) */}
        <Pressable
          style={[styles.navButton, isActive('MessageInbox') && styles.activeButton]}
          onPress={() => navigation.navigate('MessageInbox', { uid, pid, type })}
        >
          <Icon name="comments" size={24} color={isActive('MessageInbox') ? '#ffb6c1' : '#fff'} />
        </Pressable>

        {/* Forums (new) */}
        <Pressable
          style={[styles.navButton, isActive('ForumsHome') && styles.activeButton]}
          onPress={() => navigation.navigate('ForumsHome', { uid, pid, type })}
        >
          {/* use a different icon so it doesn't look like DMs */}
          <Icon name="comments-o" size={24} color={isActive('ForumsHome') ? '#ffb6c1' : '#fff'} />
        </Pressable>

        <Pressable
          style={[styles.navButton, isActive('UserProfile') && styles.activeButton]}
          onPress={() => navigation.navigate('UserProfile', { uid, pid, type })}
        >
          <Icon name="user" size={24} color={isActive('UserProfile') ? '#ffb6c1' : '#fff'} />
        </Pressable>
      </View>
    );
  }

  // Mentee/other: Home, Matching, MessageInbox, ForumsHome, Profile
  return (
    <View style={[styles.navbar, { paddingBottom: insets.bottom - 10 }]}>
      <Pressable
        style={[styles.navButton, isActive('Home') && styles.activeButton]}
        onPress={() => navigation.navigate('Home', { uid, pid, type })}
      >
        <Icon name="home" size={24} color={isActive('Home') ? '#ffb6c1' : '#fff'} />
      </Pressable>

      <Pressable
        style={[styles.navButton, isActive('MentorMatching') && styles.activeButton]}
        onPress={() => navigation.navigate('MentorMatching', { uid, pid, type })}
      >
        <Icon name="users" size={24} color={isActive('MentorMatching') ? '#ffb6c1' : '#fff'} />
      </Pressable>

      {/* Direct Messages (kept) */}
      <Pressable
        style={[styles.navButton, isActive('MessageInbox') && styles.activeButton]}
        onPress={() => navigation.navigate('MessageInbox', { uid, pid, type })}
      >
        <Icon name="comments" size={24} color={isActive('MessageInbox') ? '#ffb6c1' : '#fff'} />
      </Pressable>

      {/* Forums (new) */}
      <Pressable
        style={[styles.navButton, isActive('ForumsHome') && styles.activeButton]}
        onPress={() => navigation.navigate('ForumsHome', { uid, pid, type })}
      >
        <Icon name="comments-o" size={24} color={isActive('ForumsHome') ? '#ffb6c1' : '#fff'} />
      </Pressable>

      <Pressable
        style={[styles.navButton, isActive('UserProfile') && styles.activeButton]}
        onPress={() => navigation.navigate('UserProfile', { uid, pid, type })}
      >
        <Icon name="user" size={24} color={isActive('UserProfile') ? '#ffb6c1' : '#fff'} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    minHeight: 35,
    backgroundColor: '#ed469a',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
  },
  navButton: { padding: 10 },
  activeButton: { backgroundColor: '#ffe4e1', borderRadius: 10 },
});

export default Navbar;
