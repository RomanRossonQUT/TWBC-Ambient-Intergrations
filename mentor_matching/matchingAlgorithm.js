import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDocs, collection, query, where, getDoc, limit, addDoc, updateDoc, startAfter, increment, deleteDoc} from "firebase/firestore";
import { db, auth } from '../firebaseConfig';

/*
    This file contains all the helper functions used in the mentor matching functionalities. 
    Refer to the handover document for a detailed explanation of the mentor matching process.

    Code written by Katelyn Beresford (katelynberesford@gmail.com)
    Last edited 23/10/24
*/



const RATELIMIT = 10;   // the number of mentors to retrieve in each block



/*
    Initialises tag like count document entries in firestore for 
    a given profile.

    @param {string} pid : the profile ID to initialise liked tags for

    @return {array} tagsArray : array of 0s of size iTagCount + sTagCount
    @return {number} iTagCount : number of interest type tags
    @return {number} sTagCount : number of skill type tags
*/
async function initLikedTags(pid) {
    const tagsArray = [];

    const iTagsSnap = await getDocs(collection(db, "InterestTags"));
    const sTagsSnap = await getDocs(collection(db, "SkillTags"));

    iTagsSnap.forEach((tag) => {
        addDoc(collection(db, "LikedTags"), {
            likeCount: 0,
            profileID: pid,
            tagID: tag.data()["tagID"],
            tagType: "Interest"
        });
        tagsArray.push(0);
    });

    sTagsSnap.forEach((tag) => {
        addDoc(collection(db, "LikedTags"), {
            likeCount: 0,
            profileID: pid,
            tagID: tag.data()["tagID"],
            tagType: "Skill"
        });
        tagsArray.push(0);
    });

    iTagCount = iTagsSnap.size;
    sTagCount = sTagsSnap.size;

    return [tagsArray, iTagCount, sTagCount];
}


/*
    Retrieves an array of the tags' like counts for a given user's 
    mentee profile from the firestore database or creates them if 
    none exist.

    TODO:   Does not account for if new tags have been added to the system
            after initial initialisation

    @param {string} uid : User ID to retrieve liked tags for

    @return {array} likedTagsRaw : array of the tags' like counts
    @return {number} menteeID : the user's mentee ID
    @return {number} iTagCount : number of interest type tags
    @return {number} sTagCount : number of skill type tags
*/
async function retrieveLikedTags(uid) {
    try {
        // retrieve the profileID for the users mentee profile
        const profileSnap = await getDoc(doc(db, "Users", uid));

        if (profileSnap.exists()) {
            // seperate out menteeID (== profileID)
            const data = profileSnap.data();
            const menteeID = data["menteeID"];
            //console.log("menteeID:", menteeID);

            // now want to find the liked tags for that mentee

            // create array for plotting liked tags
            let likedTagsRaw = [];
            // and the count for how many of each tag type
            let iTagCount = 0;
            let sTagCount = 0;

            // get info from the db and store in array
            const likesQuery = query(collection(db, "LikedTags"), where("profileID", "==", menteeID))
            const likesSnap = await getDocs(likesQuery);

            // check if liked tags actually exist yet
            if (likesSnap.empty) {
                // initialise likedTags for the mentee
                console.log("No liked tags: initialising now");
                [likedTagsRaw, iTagCount, sTagCount] = await initLikedTags(menteeID);
            } else {
                // order liked tags by type and then id
                const iTags = [];
                const sTags = [];
                likesSnap.forEach((doc) => {
                    //console.log(doc.data());
                    if (doc.data()['tagType'] == "Interest") {
                        iTags[doc.data()['tagID'] - 1] = doc.data()['likeCount'];
                        iTagCount += 1;
                    } 
                    if (doc.data()['tagType'] == "Skill") {
                        sTags[doc.data()['tagID'] - 1] = doc.data()['likeCount']
                        sTagCount += 1;
                    }
                });
                // join the liked tags together into one array
                likedTagsRaw = iTags.concat(sTags);

                //console.log("likedTagsRaw:", likedTagsRaw);
            }

            //console.log("i:", iTagCount, ", s:", sTagCount);

            // likedTagsRaw should be populated now
    
            return [likedTagsRaw, menteeID, iTagCount, sTagCount]

        } else {
            console.log("No such user (retrieveLikedTags() @ matchingAlgorithm.js)");
        }
    } catch (error) {
        console.error('Error (in retrieveLikedTags() @ matchingAlgorithm.js):', error);
    }
}


/*
    Takes an array of tags' like counts and normalises it to plot against
    the mentors' assigned tags.

    @param {array} rawLikedTags : array of number of times a tag was liked by the mentee

    @return {array} normalisedLikedTags : normalised version of the given array (all values [0, 1])
*/
async function processLikedTags(rawLikedTags) {
    // check for an array of only 0s
    if (rawLikedTags.some(item => item !== 0) == false) {
        // only zeros
        return rawLikedTags
    } else {
        // not only zeros
        const normalisedLikedTags = [];

        const minCount = Math.min(...rawLikedTags);
        const countRange = Math.max(...rawLikedTags) - minCount;

        for (let i = 0; i < rawLikedTags.length; i++) {
            normalisedLikedTags[i] = (rawLikedTags[i] - minCount) / countRange;
        }

        return normalisedLikedTags
    }
}


/*
    Increases the count of a mentee's liked tags based off the tags assigned
    to a mentor they accepted a match with. 

    @param {number} pid : the profile ID of the mentee
    @param {array} tagArray : the mentor's tag array

    @return {array} processedLikedTags : the normalised array of the mentee's updated liked tags
*/
async function updateLikedTags(pid, tagArray) {
    try {
        const likedTagsSnap = await getDocs(query(collection(db, "LikedTags"), where("profileID", "==", pid)));

        const interestIDs = [];
        const skillIDs = [];

        /* 
            limiting calls to the db by also saving updated likes locally
            rather than rereading & processing all those liked tags docs every time
        */
        const interestCounts = [];
        const skillCounts = [];

        likedTagsSnap.forEach((tag) => {
            //console.log(tag.data());

            if (tag.data()["tagType"] == "Interest") {
                interestIDs[tag.data()["tagID"] - 1] = tag.id;
                interestCounts[tag.data()["tagID"] - 1] = tag.data()["likeCount"];

            } else if (tag.data()["tagType"] == "Skill") {
                skillIDs[tag.data()["tagID"] - 1] = tag.id;
                skillCounts[tag.data()["tagID"] - 1] = tag.data()["likeCount"];

            } else {
                console.warn("A liked tag is missing a type:", tag.id);
            }
        });

        console.log("mentor tag array:", tagArray);

        const likedTagsIDs = interestIDs.concat(skillIDs);
        const likedTagsArray = interestCounts.concat(skillCounts);


        console.log("ids:", likedTagsIDs);
        console.log("old count:", likedTagsArray);
        
        console.log();
        console.log(" --- updating liked tag counts --- ");
        console.log();
        for (let i = 0; i < likedTagsIDs.length; i++) {
            //console.log("i:", i);
            //console.log("tagArray[i]:", tagArray[i]);
            //console.log("likedTagsIDs[i]:", likedTagsIDs[i]);
            if (tagArray[i] == 1) {
                updateDoc(doc(db, "LikedTags", likedTagsIDs[i]), {
                    likeCount: increment(1)
                });
                likedTagsArray[i] += 1;
            }
        }

        console.log();
        console.log("new raw count:", likedTagsArray);
        
        const processedLikedTags = await processLikedTags(likedTagsArray);

        console.log("new normalised count:", processedLikedTags);
        
        return processedLikedTags;

    } catch (error) {
        console.error('Error (in updateLikedTags() @ matchingAlgorithm.js):', error);
        return false;
    }
}


/*
    Process a snapshot of mentors returned from firestore into an
    array of formatted objects.

    @param {QuerySnapshot} <mentorProfiles> : snapshot of mentor profile docs
    @param {number} iTagCount : number of interest type tags
    @param {number} sTagCount : number of skill type tags

    @return {array} MentorsArray : array of mentors formatted into objects containing profileID, 
                                    profileData, and profileTags
*/
async function processMentors(mentorProfiles, iTagCount, sTagCount) {
    const MentorsArray = [];

    mentorProfiles.forEach((doc) => {      
        // -- store profile data --
        const profile = doc.data();

        // -- init empty tags --
        const tags = new Array((iTagCount + sTagCount)).fill(0);

        // -- store in an object --

        const mentor = {
            profileID: doc.data()["profileID"],
            profileData: profile,
            profileTags: tags
        };

        MentorsArray.push(mentor);
    });

    // format the profile tags into one array of 0s and 1s for matching
    for (i in MentorsArray) {
        for (tag in MentorsArray[i]["profileData"]["interests"]) {
            MentorsArray[i]["profileTags"][(MentorsArray[i]["profileData"]["interests"][tag] - 1)] = 1;
        }
        for (tag in MentorsArray[i]["profileData"]["skills"]) {
            MentorsArray[i]["profileTags"][(MentorsArray[i]["profileData"]["skills"][tag] + (iTagCount - 1))] = 1;
        }
    }

    return MentorsArray;
}


/*
    Retrieve a block of mentors for matching. Mentors are processed into an array of objects containing 
    profileID, profileData, and profileTags. Any created matches that were never acknowledged by the 
    mentee or mentor are included in the array. Any matches already made and acknowlegded previously
    are removed. If the mentee runs out of mentors, MentorsArray returns null and newLastDoc returns a 
    message (that isn't actually used anywhere rn lol).

    TODO:   created but unacknowlegded matches (so ones shown to the mentee but not responded to before leaving
            the screen or the app) are included in the call of the array so they don't get lost. Intention was
            to have that mentor show up first (to continue where the mentee left off at) when reopening the mentor
            matching screen, but this does not happen. Time constraints prevented this from being fixed.

    @param {number} pid : the mentee's profile ID
    @param {boolean} firstRun : set to true if first time mentors are being collected during this 
                                load of the app, else false
    @param {fieldValues||null} lastDoc : the last document from the previous mentor retrieval
    @param {number} iTagCount : number of interest type tags
    @param {number} sTagCount : number of skill type tags

    [MentorsArray, newLastDoc];

    @return {array||null} MentorsArray : array of mentors formatted into objects containing profileID, 
                                            profileData, and profileTags OR null if no more available 
    @return {fieldValues||string} newLastDoc : the last document of the mentors firestore call snapshot 
                                                OR explanation message if MentorsArray is null
*/
async function retrieveMentors(pid, firstRun, lastDoc, iTagCount, sTagCount) {
    const plimit = RATELIMIT; // the number of profiles to call in one go, this value can be adjusted

    var mentorProfiles;
    // get a block of n = plimit unprocessed mentor profiles 
    if (firstRun) {
        mentorProfiles = await getDocs(query(collection(db, "Profiles"), where("profileType", "==", "Mentor"), limit(plimit)));

        if (mentorProfiles.empty) {
            // either no mentor profiles exist, or an error occurred.
            const msg = "Sorry! Either no mentors exist at this time, or an error has occurred retrieving them. Please try again later.";
            return [null, msg];
        }

    } else {
        mentorProfiles = await getDocs(query(collection(db, "Profiles"), 
            where("profileType", "==", "Mentor"),
            startAfter(lastDoc),
            limit(plimit)));
        
        if (mentorProfiles.empty) {
            // the mentee has looked through all mentor profiles
            const msg = "You've seen all of our available mentors, but more join all the time! Check in again later, or revisit skipped mentors in the meantime.";
            return [null, msg];
        }
    }

    const newLastDoc = mentorProfiles.docs[mentorProfiles.docs.length-1];

    // process those mentors

    let MentorsArray = await processMentors(mentorProfiles, iTagCount, sTagCount);

    // filter out any existing matches or move created but unresponded to front

    const matchSnap = await getDocs(query(collection(db, "Matches"), where("menteeID", "==", pid)));

    if (!matchSnap.empty) {
        // if matches have already been made put them into an array
        const matchesToRemove = [];
        const matchesToAdd = [];

        //console.log("matches:");
        matchSnap.forEach((match) => {
            //console.log(match.id, "=>", match.data()["mentorID"]);

            // for matches created but not acknowledged add to list and delete from db
            if (match.data()["state"] == "Created") {
                matchesToAdd.push(match.data()["mentorID"]);
                deleteDoc(doc(db, "Matches", match.id)); 
            }
            
            // we want to add all the matches to ones to remove
            // because otherwise when adding created but unacknowlegded ones to the start
            // we might get double ups
            matchesToRemove.push(match.data()["mentorID"]);
        });

        // remove already viewed matches, if any
        if (matchesToRemove.length > 0) {
            MentorsArray = MentorsArray.filter((mentor) => !matchesToRemove.includes(mentor["profileID"]));
        }

        // add created but unacknowledged matches to start, if any
        if (matchesToAdd.length > 0) {
            //console.log("matchesToAdd:", matchesToAdd);
            const profilesSnap = await getDocs(query(collection(db, "Profiles"), where("profileID", "in", matchesToAdd)));
            const createdArray = await processMentors(profilesSnap, iTagCount, sTagCount);
            for (i in createdArray) {
                MentorsArray.unshift(createdArray[i]);
            }
            console.log("mentors array after adding created:", MentorsArray);
        }

        //console.log(MentorsArray.length);
    
        // if the array is now empty, run again for more profiles
        if (!MentorsArray.length) {
            // hopefully this is recursive - it is :D
            const [value1, value2] = await retrieveMentors(pid, false, newLastDoc, iTagCount, sTagCount);
            return [value1, value2]; // end function call here
        } else {
            // else return the processed mentors not yet matched to the mentee
            return [MentorsArray, newLastDoc];
        }

    } else {
        // if nothing to filter, just return the processed mentors and a point to return to
        return [MentorsArray, newLastDoc];
    }
}


/*
    Calculates the euclidean distance between two points (tag arrays)

    @param {array} array1 : array of numbers range [0, 1] of length equal to number of tags
    @param {array} array2 : array of numbers range [0, 1] of length equal to number of tags

    @return {number} distance : the distance between the two given points
*/
async function euclideanDistance(array1, array2) {
    let distance = 0;
    for (i in array1) {
        distance += (array1[i] + array2[i])^2;

    }
    return distance;
}


/*
    Calculates and returns the best match from a batch of mentors based 
    off the mentee's liked tags. Each mentor tag array's distance from the 
    mentee's liked tags array using euclidean distance.

    @param {array} likedTags : the mentee's tag like counts array
    @param {array} mentors : array of available mentors as objects
    @param {number} menteeID : menteeID to match for

    [bestMatch, newMentors]
    @return {object} bestMatch : the mentor object of the best possible match
    @return {array} newMentors : the array given for mentors with the best match removed
*/
async function findMatchFromList(likedTags, mentors, menteeID) {
    let bestMatch = null;
    let bestDistance = null;

    // calculate distance for each mentor to the mentee
    for (let i = 0; i < mentors.length; i++) {

        const distance = await euclideanDistance(likedTags, mentors[i]["profileTags"]);
        
        if (bestDistance == null || distance < bestDistance) {
            bestDistance = distance;
            bestMatch = mentors[i];
        }
    }

    //console.log(bestDistance);
    //console.log(bestMatch);

    // add match to the database
    addDoc(collection(db, "Matches"), {
        menteeID: menteeID,
        mentorID: bestMatch["profileID"],
        menteeApproved: null,
        mentorApproved: null,
        state: "Created"
    })

    // remove match from the available list
    newMentors = mentors.filter(function(item) {
        return item != bestMatch
    })

    //console.log("new mentors list:", newMentors);

    return [bestMatch, newMentors];
}


/*
    Update a match with the values given. menteeID and mentorID are required, but any other fields
    can be left null if not required for update.

    @param {number} menteeID : the mentee's ID for the match
    @param {number} mentorID : the mentor's ID for the match
    @param {boolean||null} menteeApproved : the mentee's response to the match (true for accepting the match, false for declining it)
    @param {boolean||null} mentorApproved : the mentor's response to the match (true for accepting the match, false for declining it)
    @param {string||null} state : the status of the match (options: Created, Pending, Rejected, Active)

    @return {boolean} : returns true if no errors encountered.
*/
async function updateMatch(menteeID, mentorID, menteeApproved = null, mentorApproved = null, state = null) {
    try {

        const matchSnap = await getDocs(query(collection(db, "Matches"), where("mentorID", "==", mentorID), where("menteeID", "==", menteeID)));
        const match = matchSnap.docs[0];

        if (mentorApproved != null) {
            await updateDoc(doc(db, "Matches", match.id), {
                mentorApproved: mentorApproved
            });
        } 
        if (menteeApproved != null) {
            await updateDoc(doc(db, "Matches", match.id), {
                menteeApproved: menteeApproved
            });
        }
        if (state != null) {
            await updateDoc(doc(db, "Matches", match.id), {
                state: state
            });
        }

        return true;

    } catch (error) {

        console.error('Error (in updateMatch() @ matchingAlgorithm.js):', error);
        return false;
    }
}


/*
    Retrieves pending and active (optionally also rejected) matches associated with a profile 
    and returns as an array of objects with fields ID, name, and status. 

    @param {number} profileID : the profile's ID to retrieve matches for
    @param {string} profileType : the profile's type ["Mentor", "Mentee"]
    @param {boolean} includeRejected : set to true if wishing to include rejected matches in retrieval

    @return {array} matchesArray : array of matches that satify given conditions
*/
async function retrieveMatches(profileID, profileType, includeRejected = false) {

    const statusArray = ["Pending", "Active"];
    if (includeRejected) {
        statusArray.push("Rejected");
    }

    const matchesArray = [];

    if (profileType == "Mentor") {
        //console.log(profileID, profileType)
        const matchesSnap = await getDocs(query(collection(db, "Matches"), where("mentorID", "==", profileID), where("state", "in", statusArray)));

        if (!matchesSnap.empty) {
            // there are matches
            matchesSnap.forEach((match) => {
                //console.log(match.data());
                const profile = {
                    ID: match.data()["menteeID"],
                    name: null,
                    status: match.data()["state"]
                }
                matchesArray.push(profile);
            });
        }

    } else if (profileType == "Mentee") {
        //console.log(profileID, profileType);

        const matchesSnap = await getDocs(query(collection(db, "Matches"), where("menteeID", "==", profileID), where("state", "in", statusArray)));

        if (!matchesSnap.empty) {
            // there are matches
            matchesSnap.forEach((match) => {
                //console.log(match.data());
                const profile = {
                    ID: match.data()["mentorID"],
                    name: null,
                    status: match.data()["state"]
                }
                matchesArray.push(profile);
            });
        } 

    } else {
        console.error("Invalid profile type ( retrieveMatches @ matchingAlgorithm.js )");
    }

    // populating the name fields
    for (let i = 0; i < matchesArray.length; i++) {
        const nameSnap = await getDoc(doc(db, "Profiles", matchesArray[i]["ID"].toString()));

        if (nameSnap.exists) {
            matchesArray[i]["name"] = nameSnap.data()["firstName"] + " " + nameSnap.data()["lastName"];
        } else {
            console.error("Error @ retrieveMatches for profile id =", matchesArray[i]["ID"]);
        }
    }

    //console.log(matchesArray);

    return matchesArray;
}


/*
    Deletes all matches associated with the provided ID arrays with given state types.

    NOTE: does not distinguish between rejections due to the mentee or the mentor.

    @param {array} IDs : array of at least one profile ID, all IDs must be of the same type to work
    @param {array} statesToDelete : array of at least one state type 
                                    (options: ["Created", "Pending", "Rejected", "Active"])
    @param {string} type: indicates what type of IDs have been provided (options: "Mentee" (default), "Mentor")

    @return {boolean} : returns true if no issue encountered
*/
async function deleteMatches(IDs, statesToDelete, type = "Mentee") {
    try {
        if (!IDs.length || !statesToDelete.length) {
            // an array has been left empty
            console.warn("Arrays require size of at least 1 (in deleteMatches() @ matchingAlgorithm.js)");
            return false;
        }

        console.log(IDs, statesToDelete, type);
        var matchesSnap;

        if (type == "Mentee") {
            matchesSnap = await getDocs(query(collection(db, "Matches"), 
                                                where("menteeID", "in", IDs), 
                                                where("state", "in", statesToDelete)));
        } else if (type == "Mentor") {
            matchesSnap = await getDocs(query(collection(db, "Matches"), 
                                                where("mentorID", "in", IDs), 
                                                where("state", "in", statesToDelete)));
        } else {
            console.warn("Invalid type input (in deleteMatches() @ matchingAlgorithm.js)");
            return false;
        }
    
        if (!matchesSnap.empty) {
            matchesSnap.forEach((match) => {
                //console.log(match.id);
                deleteDoc(doc(db, "Matches", match.id));
            });
        }

        return true;

    } catch (error) {
        console.warn("Error encountered (in deleteMatches() @ matchingAlgorithm.js):", error);
        return false;
    }
}


/*
    <function description>

    @param {type} <variable name> : <variable description>

    @return {type} <variable name> : <variable description>
*/
async function setUpMatching(uid, firstBatch = true, lastDoc = null) {
    // retrieving the liked tags as their raw count values
    console.log();
    console.log(" --- retrieving & processing liked tags ---");
    console.log();
    const [likedTagsRaw, pid, iTagCount, sTagCount] = await retrieveLikedTags(uid);
    console.log("raw tag counts:", likedTagsRaw);

    // normalising the liked tag counts between [0, 1], unless only 0s
    const normLikedTags = await processLikedTags(likedTagsRaw);
    console.log("normalised tag counts:", normLikedTags);

    // retrieving and processing mentors
    console.log();
    console.log(" --- getting mentors --- ");
    console.log();
    const [mentors, newLastDoc] = await retrieveMentors(pid, firstBatch, lastDoc, iTagCount, sTagCount);

    return [pid, normLikedTags, mentors, newLastDoc];
}


/*
    Updates a match in response to a mentee declining or accepting a presented match

    @param {string} response : the mentee's response (Options: Approve, Decline)
    @param {number} menteeID : the mentee's ID for the match
    @param {number} mentorID : the mentor's ID for the match
*/
async function menteeRespondToMatch(response, menteeID, mentorID) {
    //console.log(mentor["profileID"]);

    // update the database

    if (response == "Approve") {
        updateMatch(menteeID, mentorID, true, null, "Pending");
    } else if (response == "Decline") {
        updateMatch(menteeID, mentorID, false, null, "Rejected");
    } else {
        console.error("Error: Invalid mentee response.");
    }
}


/*
    Updates a match in response to a mentor declining or accepting a presented match

    @param {string} response : the mentors's response (Options: Approve, Decline)
    @param {number} menteeID : the mentee's ID for the match
    @param {number} mentorID : the mentor's ID for the match
*/
async function mentorRespondToMatch(response, mentorID, menteeID) {
    
    if (response == "Approve") {
        await updateMatch(menteeID, mentorID, null, true, "Active");
    } else if (response == "Decline") {
        await updateMatch(menteeID, mentorID, null, false, "Rejected");
    } else {
        console.error("Error: Invalid mentor response.");
    }
}




export { setUpMatching, 
    findMatchFromList, 
    menteeRespondToMatch, 
    updateLikedTags, 
    retrieveMentors, 
    retrieveMatches,
    mentorRespondToMatch,
    deleteMatches }
