import "dotenv/config";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytes,
  uploadString,
  deleteObject,
} from "firebase/storage";
import fs from "fs";

const {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER,
  FIREBASE_APP_ID,
} = process.env;
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER,
  appId: FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const handleFileUpload = async (file = "") => {
  try {
    if (file?.uri?.includes("http")) return file.uri;
    const now = new Date();
    const year = now.getFullYear();
    const month = ("0" + (now.getMonth() + 1)).slice(-2);
    const day = ("0" + now.getDate()).slice(-2);
    const hours = ("0" + now.getHours()).slice(-2);
    const minutes = ("0" + now.getMinutes()).slice(-2);
    const seconds = ("0" + now.getSeconds()).slice(-2);

    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    const storage = getStorage();

    // Create a reference to image
    const fileRef = ref(
      storage,
      `${formattedDate} ${formattedTime} ${file.filename}`
    );

    if (!file.uri || !file.filename) return;
    const filePath = file.uri.replaceAll("file://", "");
    const fileBuffer = fs.readFileSync(filePath);
    const metatype = { contentType: file.mime, name: file.filename };
    // 'file' comes from the Blob or File API
    const snapshot = await uploadBytes(
      fileRef,
      new Uint8Array(fileBuffer),
      metatype
    );
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (err) {
    return "";
  }
};
export const handleTextUpload = async (file = "") => {
  try {
    const storage = getStorage();
    // Create a reference to image
    const fileRef = ref(storage, `${Date.now()}${file.filename}`);
    const base64String = file.uri;
    try {
      // Upload to Firebase Storage
      const snapshot = await uploadString(fileRef, base64String);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {}
  } catch (err) {
    return "";
  }
};
export const handleDeleteFileUpload = async (urls = []) => {
  try {
    const storage = getStorage();
    try {
      // Delete the file based of reference
      await Promise.all(
        urls.map((url) => {
          // Extract the file path from the URL
          const filePath = decodeURIComponent(url.split("?alt=media")[0]);
          const fileRef = ref(storage, filePath);
          deleteObject(fileRef)
            .then(() => {
              const res = "File deleted successfully";
              return res;
            })
            .catch((error) => {
              const res = "Uh-oh, an error occurred!";
              return res;
            });
        })
      );
    } catch (error) {}
  } catch (err) {
    return "";
  }
};
export const handleDeleteTextUpload = async (fileDetails = "") => {
  try {
    const storage = getStorage();
    const fileRef = ref(storage, `${fileDetails}`);

    try {
      // Delete the file based of reference
      deleteObject(fileRef)
        .then(() => {
          const res = "File deleted successfully";
          return res;
        })
        .catch((error) => {
          const res = "Uh-oh, an error occurred!";
          return res;
        });
    } catch (error) {}
  } catch (err) {
    return "";
  }
};
export const extractAllFileUrls = async (spots) => {
  const fileURLs = [];

  function extractFileURLs(obj) {
    obj.image && fileURLs.push(obj.image);
    obj.video && fileURLs.push(obj.video);
    obj.categories.length &&
      obj.categories.map((c) => c.image && fileURLs.push(c.image));
    obj.popularCategories.length &&
      obj.popularCategories.map((c) => c.image && fileURLs.push(c.image));
  }
  await Promise.all(
    spots.map((spot) => {
      extractFileURLs(spot);
    })
  );
  return fileURLs;
};
export const handleMultipleFileUploads = async (array) => {
  let totalArrFiles = [];
  await Promise.all(
    array.map(async (category) => {
      const image = await handleFileUpload(category.image);
      const obj = {
        ...category,
        image,
      };
      totalArrFiles.push(obj);
    })
  );
  return totalArrFiles;
};
