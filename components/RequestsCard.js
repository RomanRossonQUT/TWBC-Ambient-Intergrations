import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

const RequestsCard = ({ mentorName, industry, status, isMentee, onSendMessage, onApprove, onDeny }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.mentorDetails}>
        <Text style={styles.mentorName}>{mentorName}</Text>
        <Text style={styles.mentorIndustry}>{industry}</Text>
      </View>

      {isMentee ? (
        <Pressable 
          style={[
            styles.messageButton, 
            status === "pending" ? styles.pendingButton : styles.approvedButton
          ]} 
          onPress={onSendMessage}
          disabled={status === "pending"} // Disable button if request is pending
        >
          <Text style={styles.messageButtonText}>
            {status === "pending" ? "Request Sent" : "Send a message"}
          </Text>
        </Pressable>
      ) : (
        status === "pending" ? (
          // If mentor, show approve and deny buttons for pending matches
          <View style={styles.actionButtons}>
            <Pressable style={styles.approveButton} onPress={onApprove}>
              <Text style={styles.buttonText}>Approve</Text>
            </Pressable>
            <Pressable style={styles.denyButton} onPress={onDeny}>
              <Text style={styles.buttonText}>Deny</Text>
            </Pressable>
          </View>
        ) : (
          // If approved, show "send a message" button
          <Pressable style={styles.messageButton} onPress={onSendMessage}>
            <Text style={styles.messageButtonText}>Send a message</Text>
          </Pressable>
        )
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
  messageButton: {
    backgroundColor: '#ed469a',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  pendingButton: {
    backgroundColor: '#ffb6c1',
  },
  approvedButton: {
    backgroundColor: '#ed469a',
  },
  messageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  approveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  denyButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default RequestsCard;
