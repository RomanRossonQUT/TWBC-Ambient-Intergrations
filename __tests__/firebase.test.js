/*import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebasetest'; // Adjust the path if necessary

jest.mock('firebase/firestore', () => ({
    getDocs: jest.fn(() => Promise.resolve({
        empty: false,
        forEach: jest.fn(callback => {
            callback({ id: 'test-doc', data: () => ({ key: 'value' }) });
        })
    })),
    collection: jest.fn(() => ({ /* mock collection reference  }))
}));

test('Firebase connection test', async () => {
    try {
        const testCollectionName = 'testDummyCollection'; 
        const collectionRef = collection(db, testCollectionName);
        const querySnapshot = await getDocs(collectionRef);

        expect(querySnapshot.empty).toBe(false); 
    } catch (error) {
        throw new Error('Failed to connect to Firebase: ' + error.message);
    }
});
*/

test('1+1=2', () => {
    expect(1 + 1).toBe(2);
});