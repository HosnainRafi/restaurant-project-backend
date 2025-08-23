import * as admin from "firebase-admin";
import path from "path";

// Construct the absolute path to the service account key
const serviceAccountPath = path.join(
  process.cwd(),
  "firebase-service-account-key.json"
);

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

// Export the initialized admin object for use in other parts of your app
export { admin };
