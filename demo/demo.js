// REVIEW
import { doc, setDoc, getDocs, collection, query, where, getDoc, limit, addDoc, updateDoc, startAfter, increment, deleteDoc} from "firebase/firestore";
import { db, auth } from '../firebaseConfig';
import { deleteMatches } from '../mentor_matching/matchingAlgorithm';

/* 
    WARNING:    DEMO MODE WILL ALTER THE FIRESTORE DATA ENTRIES. DO NOT RUN DEMO MODE WITH MORE THAN ONE USER
                USING THE APP AT ONCE. DO NOT TOGGLE DEMO MODE ON WITHOUT UNDERSTANDING WHAT IT DOES FIRST.

    This file contains all functions used for the demo mode of the app. The following includes instructions
    and an explanation for the demo mode. The demo mode was intended only for use for recording the demo video
    assignment and to present at showcase, and may not hold up in further development as is. 

    To Toggle Demo Mode:
        Set the toggleDemoMode.json value to true to turn demo mode on, or false to turn it off. The check for
        this is located in App.js, and calls the initDemo() located in this file.

    Demo Process:
        1. Login using the demo account 
            Email: Demo@mail.com
            Password: Password
        2. Choose the mentee option and demonstrate creation of a mentee profile. Explain that it is exactly the
            same as for mentor profile creation.
        3. Browse through the matching screen, demonstrating accepting and declining of the matches.
        4. Show the pending matches screen, explaining the active and pending states of a match. An approved match
            has been preemptively created on load to help demonstrate this. 
        5. Show the profile screen, showcasing how the details entered on creation show up on this screen.
        6. Using the switch profile button on the profile screen, switch to a mentor profile. One has been
            created already and should not be altered in firestore. 
        7. Show the pending matches screen again, this time from the mentor's perspective. Premade matches will have
            been reset on load of the app, so you can demonstrate accepting and declining a match.
        8. Logout of the user's account via the profile screen.

    Explanation of Behind the Scenes:
        Upon loading the app, firestore will be adjusted so that it is ready for a demo. The mentee profile of the
        demo user will be deleted if one exists, alongside it's liked tags and all matches associated with it. 
        This demo mode assumes that if a mentee profile exists, it is the most recent profile created. ProfileCount
        will be adjusted as necessary. All matches associated with the mentor profile will be deleted, and example 
        matches created, as to reset for the approval and decline demonstration. Example mentors and mentees have
        been created preemptively and are not altered in this code.

    Code written by Katelyn Beresford (katelynberesford@gmail.com)
    Last edited 24/10/24
*/



/*
    Initialises the demo mode upon load/reload. Calls the demo user's account and
    extracts the associated mentor and mentee IDs (or their null status) and sets
    up all datastore entries in accordance with the demo steps.
*/
async function initDemo() {
    const user = await getDoc(doc(db, "Users", "K0lzMnLkPffLbyq3ETyNcUHnyrl1"));
    const menteeID = user.data()["menteeID"];
    const mentorID = user.data()["mentorID"];

    if (mentorID == null) {
        console.error("Demo user is missing it's mentor profile: Aborting demo mode. Create a mentor profile and reload to enter demo mode.");
        return;
    }

    await resetMenteesMatches(menteeID);
    await deleteMenteeProfile(menteeID);
    await resetMentorsMatches(mentorID);
}


/*
    Deletes the demo user's mentee profile (if one exists) so that profile creation can 
    be demonstrated. The associated Profiles doc is deleted and the associated Users doc is
    updated so that the menteeID is null. profileCount is also updated so that the count
    does not continue to increase beyond necessary. The LikedTags docs associated with the
    mentee are also deleted. If no mentee profile exists, nothing is done.

    @param {number || null} menteeID : the demo user's mentee ID
*/
async function deleteMenteeProfile(menteeID) {
    // delete the mentee profile for user ID 'K0lzMnLkPffLbyq3ETyNcUHnyrl1'
    if (menteeID != null) {
        deleteDoc(doc(db, "Profiles", String(menteeID)));
        updateDoc(doc(db, "Users", "K0lzMnLkPffLbyq3ETyNcUHnyrl1"), {menteeID: null});
        updateDoc(doc(db, "Profiles", "profileCount"), {count: menteeID - 1});

        // delete all the like tags
        const likeTagsSnap = await getDocs(query(collection(db, "LikedTags"), where("profileID", "==", menteeID)));
        likeTagsSnap.forEach((tag) => {
            deleteDoc(doc(db, "LikedTags", tag.id));
        })
    }
}


/*
    Resets the matches for the mentee's POV of the matching process. Checks if a mentee profile
    is associated with the demo user and deletes all of the matches associated with that profile.
    Also creates an approved match for demonstration of the pending matches screen for that mentee
    profile ID. 
    If no mentee ID exists yet, assumes the next ID will be used for creating the profile and a 
    approved match is created (if it doesn't already exist) using that assumed ID

    @param {number || null} menteeID : the demo user's mentee ID
*/
async function resetMenteesMatches(menteeID) {
    if (menteeID != null) {
        // delete all existing matches for the mentee
        await deleteMatches([menteeID], ["Created", "Pending", "Rejected", "Active"]);

        // create a match for them that is already approved
        addDoc(collection(db, "Matches"), {
            menteeID: menteeID,
            mentorID: 3,
            menteeApproved: true,
            mentorApproved: true,
            state: "Active"
        });

    } else {
        // theres no mentee yet, but create a match for the ID they will have, if one doesnt exist already
        
        const predictedIDSnap = await getDoc(doc(db, "Profiles", "profileCount"));
        const predID = predictedIDSnap.data()["count"] + 1;

        const approvedMatchSnap = await getDocs(query(collection(db, "Matches"), where("menteeID", "==", predID), where("mentorID", "==", 3)));

        if (approvedMatchSnap.empty) {
            addDoc(collection(db, "Matches"), {
                menteeID: predID,
                mentorID: 3,
                menteeApproved: true,
                mentorApproved: true,
                state: "Active"
            })
        }
    }  
}


/*
    Resets the mentor's POV for matching. Deletes all existing matches associated with a
    mentorID to completely reset the matches presented and their statuses. Three matches
    are made for the mentor, two at pending and one at active to display all possibilities.

    @param {number} mentorID : the demo user's mentor ID
*/
async function resetMentorsMatches(mentorID) {
    // first delete all existing matches for this mentor
    await deleteMatches([mentorID], ["Created", "Pending", "Rejected", "Active"], "Mentor");

    // create some matches for the mentor to look through

    addDoc(collection(db, "Matches"), {
        menteeID: 11,
        mentorID: mentorID,
        menteeApproved: true,
        mentorApproved: null,
        state: "Pending"
    })
    addDoc(collection(db, "Matches"), {
        menteeID: 12,
        mentorID: mentorID,
        menteeApproved: true,
        mentorApproved: null,
        state: "Pending"
    })
    addDoc(collection(db, "Matches"), {
        menteeID: 13,
        mentorID: mentorID,
        menteeApproved: true,
        mentorApproved: true,
        state: "Active"
    })
}



export {
    initDemo
}