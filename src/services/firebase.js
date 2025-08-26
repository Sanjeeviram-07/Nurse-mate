import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc, setDoc, query, where, getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzDB9xVuVq_tishkgMQtoEOMiyaKFTZ2c",
  authDomain: "nurse-mate-63ec1.firebaseapp.com",
  projectId: "nurse-mate-63ec1",
  storageBucket: "nurse-mate-63ec1.firebasestorage.app",
  messagingSenderId: "160454707154",
  appId: "1:160454707154:web:91d9d2cbd75c3e700baa0b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase app and auth
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Export auth functions
export { signInWithEmailAndPassword, createUserWithEmailAndPassword };

// Export Firestore functions directly from firebase/firestore
export { collection, getDocs, addDoc, setDoc, query, where, getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Export Storage functions
export { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Export collections
export const usersCollection = collection(db, 'users');
export const logsCollection = collection(db, 'logs');
export const hospitalsCollection = collection(db, 'hospitals');
export const clinicalLogsCollection = collection(db, 'clinicalLogs');
export const shiftsCollection = collection(db, 'shifts');

// Cloud Functions
const createHospitalAdminFunction = httpsCallable(functions, 'createHospitalAdmin');
const getHospitalsFunction = httpsCallable(functions, 'getHospitals');
const getHospitalAdminsFunction = httpsCallable(functions, 'getHospitalAdmins');

// Helper functions
export const checkUserRole = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().role || 'student';
    }
    return null;
  } catch (error) {
    console.error('Error checking user role:', error);
    return null;
  }
};

export const isAdmin = async (uid) => {
  const role = await checkUserRole(uid);
  return role === 'hospital-admin' || role === 'university-admin';
};

export const isSuperAdmin = async (uid) => {
  const role = await checkUserRole(uid);
  return role === 'super-admin';
};

// Gmail validation function
export const isValidGmail = (email) => {
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return gmailRegex.test(email);
};

// User registration function with email verification
export const registerUser = async (email, password, name, role = 'student', hospitalId = null) => {
  try {
    // Validate Gmail address
    if (!isValidGmail(email)) {
      throw new Error('Only Gmail addresses are accepted. Please use a valid Gmail account.');
    }

    // Create user with Firebase Auth
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // Send email verification
    await sendEmailVerification(user);

    // Create user document in Firestore with emailVerified status
    const userDoc = {
      name,
      email,
      role,
      hospitalId,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);

    return {
      user,
      userDoc
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Get current user data
export const getCurrentUser = async () => {
  try {
    const user = auth.currentUser;
    console.log('getCurrentUser - auth.currentUser:', user);
    
    if (!user) {
      console.log('getCurrentUser - No authenticated user');
      return null;
    }

    console.log('getCurrentUser - Fetching user document for:', user.uid);
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = { uid: user.uid, ...userDoc.data() };
      console.log('getCurrentUser - User data:', userData);
      return userData;
    } else {
      console.log('getCurrentUser - User document does not exist');
      return null;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Hospital management functions
export const getHospitals = async () => {
  try {
    const querySnapshot = await getDocs(hospitalsCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting hospitals:', error);
    throw error;
  }
};

export const getHospitalAdmins = async () => {
  try {
    const q = query(usersCollection, where('role', '==', 'hospital-admin'));
    const querySnapshot = await getDocs(q);
    
    const admins = [];
    for (const adminDoc of querySnapshot.docs) {
      const adminData = adminDoc.data();
      if (adminData.hospitalId) {
        const hospitalDoc = await getDoc(doc(db, 'hospitals', adminData.hospitalId));
        if (hospitalDoc.exists()) {
          const hospitalData = hospitalDoc.data();
          admins.push({
            uid: adminDoc.id,
            ...adminData,
            hospitalName: hospitalData.name,
            hospitalAddress: hospitalData.address,
            deanName: hospitalData.deanName
          });
        }
      }
    }
    
    return admins;
  } catch (error) {
    console.error('Error getting hospital admins:', error);
    throw error;
  }
};

export const createHospitalAdmin = async (formData) => {
  try {
    console.log('Creating hospital admin with data:', formData);
    
    // Create hospital document first
    const hospitalDoc = {
      name: formData.hospitalName,
      address: formData.hospitalAddress,
      deanName: formData.deanName,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Adding hospital document...');
    const hospitalRef = await addDoc(hospitalsCollection, hospitalDoc);
    const hospitalId = hospitalRef.id;
    console.log('Hospital created with ID:', hospitalId);

    // Create hospital admin user
    console.log('Creating Firebase Auth user...');
    const { user } = await createUserWithEmailAndPassword(auth, formData.adminEmail, formData.adminPassword);
    console.log('Firebase Auth user created:', user.uid);

    // Create admin user document
    const adminDoc = {
      name: formData.deanName, // Using dean name as admin name
      email: formData.adminEmail,
      role: 'hospital-admin',
      hospitalId: hospitalId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Setting admin user document...');
    await setDoc(doc(db, 'users', user.uid), adminDoc);
    console.log('Admin user document created');

    // Update hospital document with admin ID
    console.log('Updating hospital with admin ID...');
    await updateDoc(doc(db, 'hospitals', hospitalId), {
      adminId: user.uid
    });
    console.log('Hospital updated with admin ID');

    return { hospitalId, adminId: user.uid };
  } catch (error) {
    console.error('Error creating hospital admin:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide helpful error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please update Firestore rules in Firebase Console to allow authenticated users to read/write.');
    } else if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use a stronger password.');
    }
    
    throw new Error(error.message || 'Failed to create hospital admin');
  }
};

export const resetHospitalAdminPassword = async (adminId) => {
  try {
    const adminDoc = await getDoc(doc(db, 'users', adminId));
    if (!adminDoc.exists()) {
      throw new Error('Admin not found');
    }

    const adminData = adminDoc.data();
    if (adminData.role !== 'hospital-admin') {
      throw new Error('User is not a hospital admin');
    }

    await sendPasswordResetEmail(auth, adminData.email);
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

export const deleteHospitalAdmin = async (adminId, hospitalId) => {
  try {
    // Delete hospital document
    await deleteDoc(doc(db, 'hospitals', hospitalId));
    
    // Delete admin user document
    await deleteDoc(doc(db, 'users', adminId));
    
    // Note: Firebase Auth user deletion requires admin SDK
    // For now, we'll just delete the Firestore documents
    // The auth user will remain but won't have access to the system
    
    return true;
  } catch (error) {
    console.error('Error deleting hospital admin:', error);
    throw error;
  }
};

// Nurse data access functions
export const getNurseClinicalLogs = async (hospitalId) => {
  try {
    const logs = [];
    
    // Check clinicalLogs collection
    const clinicalLogsQuery = query(clinicalLogsCollection, where('hospitalId', '==', hospitalId));
    const clinicalLogsSnapshot = await getDocs(clinicalLogsQuery);
    
    for (const logDoc of clinicalLogsSnapshot.docs) {
      const logData = logDoc.data();
      if (logData.nurseId) {
        const nurseDoc = await getDoc(doc(db, 'users', logData.nurseId));
        if (nurseDoc.exists()) {
          const nurseData = nurseDoc.data();
          logs.push({
            id: logDoc.id,
            ...logData,
            nurseName: nurseData.name,
            nurseEmail: nurseData.email
          });
        }
      }
    }
    
    // Also check old logs collection for backward compatibility
    const oldLogsQuery = query(collection(db, 'logs'), where('hospitalId', '==', hospitalId));
    const oldLogsSnapshot = await getDocs(oldLogsQuery);
    
    for (const logDoc of oldLogsSnapshot.docs) {
      const logData = logDoc.data();
      if (logData.userId) {
        const nurseDoc = await getDoc(doc(db, 'users', logData.userId));
        if (nurseDoc.exists()) {
          const nurseData = nurseDoc.data();
          logs.push({
            id: logDoc.id,
            ...logData,
            nurseId: logData.userId,
            nurseName: nurseData.name,
            nurseEmail: nurseData.email
          });
        }
      }
    }
    
    return logs;
  } catch (error) {
    console.error('Error getting nurse clinical logs:', error);
    throw error;
  }
};

export const getNurseShifts = async (hospitalId) => {
  try {
    const q = query(shiftsCollection, where('hospitalId', '==', hospitalId));
    const querySnapshot = await getDocs(q);
    
    const shifts = [];
    for (const shiftDoc of querySnapshot.docs) {
      const shiftData = shiftDoc.data();
      if (shiftData.nurseId) {
        const nurseDoc = await getDoc(doc(db, 'users', shiftData.nurseId));
        if (nurseDoc.exists()) {
          const nurseData = nurseDoc.data();
          shifts.push({
            id: shiftDoc.id,
            ...shiftData,
            nurseName: nurseData.name,
            nurseEmail: nurseData.email
          });
        }
      }
    }
    
    return shifts;
  } catch (error) {
    console.error('Error getting nurse shifts:', error);
    throw error;
  }
};

// Debug: Log auth object to verify initialization
console.log('Firebase auth initialized:', auth);
console.log('Firebase db initialized:', db);
console.log('Firebase config:', firebaseConfig);