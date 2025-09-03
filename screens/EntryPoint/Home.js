// -----------------------------------------------------------------------------
// Purpose: Welcome screen after login/profile creation.
// Features:
// - Greets user and explains mentor matching.
// - Routes mentees to InteractiveMatching and mentors to MENTORSCREEN3.
// - Uses Navbar for bottom navigation.
// -----------------------------------------------------------------------------

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../../components/Navbar';

const Home = ({route}) => {
  const navigation = useNavigation();
  const {uid, pid, type} = route.params;

  console.log(uid, pid, type);

  // Navigate to the appropriate matching screen based on user type
  const navToMatching = async () => {
    if (type == "Mentor") {
      navigation.navigate('MENTORSCREEN3', {uid, pid, type})
    } else {
      navigation.navigate('InteractiveMatching', {uid, pid, type})
    }
  }


  // Main render
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={[styles.optScreen, styles.optScreenFlexBox]}>
          <Image
            style={styles.header1Icon}
            contentFit="cover"
            source={require('../../assets/header-1.png')}
          />
          <View style={styles.info}>
            <Text style={[styles.mentorMatching, styles.viewDetailsTypo]}>
              Welcome!
            </Text>
            <Text style={styles.mentorMatchingAllowsContainer}>
              <Text style={styles.mentorMatchingAllows}>
                {`Mentor Matching allows you to connect with and receive education from a team of high-level experts and leaders.\n\nOpting in will allow you to select through recommended mentors based on your interests and skills.\n\n`}
              </Text>
              <Text style={[styles.letsGetStarted, styles.viewDetailsTypo]}>
                Let's get started!
              </Text>
            </Text>
          </View>
          <Pressable style={styles.buttonPrimaryWrapper}>
            <TouchableOpacity
              style={[styles.buttonPrimary, styles.optScreenFlexBox]}
              activeOpacity={0.2}
              //onPress={() => navigation.navigate('InteractiveMatching', {uid, pid, type})}
              onPress={navToMatching}
            >
              <Text style={[styles.viewDetails, styles.viewDetailsTypo]}>
                Opt-in
              </Text>
            </TouchableOpacity>
          </Pressable>
        </View>
      </ScrollView>
      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optScreenFlexBox: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  viewDetailsTypo: {
    fontFamily: 'Raleway-Bold',
    fontWeight: '700',
  },
  header1Icon: {
    width: 330,
    height: 270,
  },
  mentorMatching: {
    fontSize: 32,
    textAlign: 'left',
    color: '#000',
  },
  mentorMatchingAllows: {
    fontSize: 15,
    lineHeight: 23,
    fontFamily: 'Raleway-Regular',
    color: '#000',
  },
  letsGetStarted: {
    fontSize: 16,
    color: '#fa0066',
  },
  mentorMatchingAllowsContainer: {
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  info: {
    overflow: 'hidden',
    gap: 20,
    alignSelf: 'stretch',
  },
  viewDetails: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  buttonPrimary: {
    borderRadius: 5,
    backgroundColor: '#ed469a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  buttonPrimaryWrapper: {
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  optScreen: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 30,
    paddingTop: '20%',
    paddingBottom: '20%',
    gap: 30,
    justifyContent: 'center',
  },
  navbar: {
    height: 60,
    width: '100%',
  },
});

export default Home;
