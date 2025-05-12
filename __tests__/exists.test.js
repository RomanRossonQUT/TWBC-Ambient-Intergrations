const fs = require('fs').promises;
const path = require('path');

/**
 * Checks if the specified files exist in the given directory.
 * @param {string} dir - The directory to check for the files.
 * @param {Array<string>} files - List of file names to check.
 */
// List of files to check
const screensToCheck = [
    'About1.js',
    'About2.js',
    'About3.js',
    'CreateAccount.js',
    'LoginAccount.js',
    'StartScreen.js',
    'Welcome.js'
];

const coreFilesCheck = [
    'App.js',
    'firebaseConfig.js',
    'package.json',
];

const componentToCheck = [
    'AboutMe.js',
    'Skills.js',
    'SendMessage.js'
];

// Check if core files Exist

checkFilesExist('', coreFilesCheck);

// Check if screens Exist
checkFilesExist('screens', screensToCheck);

//Check if components exist
checkFilesExist('components', componentToCheck);








async function checkFilesExist(dir, files) {
    test('check if files exist in screens directory', async () => {
        for (const file of files) {
            const filePath = path.join(dir, file);
               try {
                await fs.access(filePath);  // Wait for fs.access to complete
                //console.log(`${file} exists at ${filePath}.`);
            } catch (err) {
                console.log(`${file} does not exist at ${filePath}.`);
            }
        }
    });
}
