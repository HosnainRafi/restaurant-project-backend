import * as admin from "firebase-admin";
import path from "path";

// Construct the absolute path to the service account key
const serviceAccountPath = path.join(
  process.cwd(),
  "firebase-service-account-key.json"
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

export default admin;
