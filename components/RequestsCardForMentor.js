import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

const RequestsCardForMentor = ({ menteeName, industry, status, onApprove, onDeny, onSendMessage }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.menteeDetails}>
        <Text style={styles.menteeName}>{menteeName}</Text>
        <Text style={styles.menteeIndustry}>{industry}</Text>
      </View>

      {/* Display Accept/Decline buttons or Send Message based on status */}
      {status === "Pending" ? (
        <View style={styles.actionButtons}>
          <Pressable style={styles.acceptButton} onPress={onApprove}>
            <Text style={styles.buttonText}>Accept</Text>
          </Pressable>
          <Pressable style={styles.declineButton} onPress={onDeny}>
            <Text style={styles.buttonText}>Decline</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.messageButton} onPress={onSendMessage}>
          <Text style={styles.messageButtonText}>Send a Message</Text>
        </Pressable>
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
  menteeDetails: {
    flexDirection: 'column',
  },
  menteeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  menteeIndustry: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  declineButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  messageButton: {
    backgroundColor: '#ed469a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  messageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default RequestsCardForMentor;
