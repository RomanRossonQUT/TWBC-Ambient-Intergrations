import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Navbar from "../components/Navbar";
import RequestsCardForMentor from "../components/RequestsCardForMentor"; // Mentor-specific card
import RequestsCardForMentee from "../components/RequestsCardForMentee"; // Mentee-specific card
import { retrieveMatches, mentorRespondToMatch } from "../mentor_matching/matchingAlgorithm";

const MENTORSCREEN3 = ({ route }) => {
  const navigation = useNavigation();
  const { uid, pid, type } = route.params;

  const [matches, setMatches] = useState([]);

  /* 
    Check type
    If mentee
      Display matches that are pending approval and active
      Show the status
    If mentor
      Display matches that are pending their approval and confirmed approved
      Show buttons to accept or decline on the pending matches
      Show approved status on active matches
  */

  const approveMatch = async (menteeID) => {
    // for a mentor to approve the match
    console.log("approve");
    await mentorRespondToMatch("Approve", pid, menteeID);
    await displayMatches(menteeID, "Active"); // Refresh matches after approval
  };

  const denyMatch = async (menteeID) => {
    // for a mentor to decline the match
    console.log("deny");
    await mentorRespondToMatch("Decline", pid, menteeID);

    await displayMatches(menteeID, "Rejected"); // Refresh matches after denial
  };

  const handleSendMessage = () => {
    console.log("Message button clicked");
    // Navigate to the messaging screen or perform message action
  };
  
  const displayMatches = async (menteeID = null, state = null) => {
    console.log(matches);
    if (!matches.length) {
      // if first time run
      const newMatches = await retrieveMatches(pid, type);
      setMatches(newMatches);
    } else {
      if (!(menteeID == null && state == null)) {
        // update locally instead of calling and formatting each time (speeds up app)
        /* const newMatchesArray = matches
        const idx = newMatchesArray.findIndex(obj => obj.ID == menteeID);
        newMatchesArray[idx].status = state;
        console.log(newMatchesArray);
        setMatches(newMatchesArray); */

        let updatedMatches;
        if (state === "Rejected") {
          updatedMatches = matches.filter((match) => match.ID !== menteeID);
        } else if (state === "Active") {
          updatedMatches = matches.map((match) =>
            match.ID === menteeID ? { ...match, status: state } : match
          );
        }
        setMatches(updatedMatches);
      }
    }
  };
  
  useEffect(() => {
    displayMatches();
  }, []);

  return (
    <View style={styles.mentorScreen}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.heading1}>
          <Text style={[styles.mentorRequests, styles.mentorRequestsFlexBox]}>
            Mentor Requests
          </Text>
          <Text
            style={[styles.pendingAndAccepted, styles.mentorRequestsFlexBox]}
          >
            Pending and Accepted requests
          </Text>
        </View>

        {matches.map((match) => (
          type === "Mentee" ? (
            <RequestsCardForMentee
              key={match.ID}
              mentorName={match.name}
              industry={match.industry}
              status={match.status}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <RequestsCardForMentor
              key={match.ID}
              menteeName={match.name}
              industry={match.industry}
              status={match.status}
              onApprove={() => approveMatch(match.ID)}
              onDeny={() => denyMatch(match.ID)}
              onSendMessage={handleSendMessage}
            />
          )
        ))}
      </ScrollView>
      <Navbar style={styles.navbar} />
    </View>
  );
};

const styles = StyleSheet.create({
  mentorRequestsFlexBox: {
    textAlign: "left",
    color: "#000",
  },
  mentorRequests: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "Raleway-Bold",
  },
  pendingAndAccepted: {
    fontSize: 18,
    fontFamily: "Raleway-Regular",
  },
  heading1: {
    gap: 10,
    overflow: "hidden",
    alignSelf: "stretch",
  },
  mentorScreen: {
    backgroundColor: "#fafafa",
    flex: 1,
    width: "100%",
  },
  contentContainer: {
    paddingHorizontal: 30,
    paddingTop: "20%",
    paddingBottom: "20%",
    gap: 30,
    alignItems: "center",
    flexGrow: 1,
  },
  navbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default MENTORSCREEN3;
