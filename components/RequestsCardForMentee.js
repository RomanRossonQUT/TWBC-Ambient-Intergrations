import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

const RequestsCardForMentee = ({ mentorName, industry, status, onSendMessage }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.mentorDetails}>
        <Text style={styles.mentorName}>{mentorName}</Text>
        <Text style={styles.mentorIndustry}>{industry}</Text>
      </View>
      
      {/* Display "Send a message" button only if the request is approved */}
      {status === "Active" ? (
        <Pressable style={styles.messageButton} onPress={onSendMessage}>
          <Text style={styles.messageButtonText}>Send a message</Text>
        </Pressable>
      ) : (
        <Text style={styles.requestStatus}>
          {status === "Pending" ? "Request Sent" : "Request Declined"}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    elevation: 2,
  },
  mentorDetails: {
    flexDirection: 'column',
  },
  mentorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mentorIndustry: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  requestStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
  },
  messageButton: {
    backgroundColor: '#ed469a',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  messageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default RequestsCardForMentee;
