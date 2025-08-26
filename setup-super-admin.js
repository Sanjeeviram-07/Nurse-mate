const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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
const auth = getAuth(app);
const db = getFirestore(app);

async function setupSuperAdmin() {
  try {
    console.log('Setting up super admin account...');
    
    // Super admin credentials (change these as needed)
    const superAdminEmail = 'superadmin@nursemate.com';
    const superAdminPassword = 'SuperAdmin123!';
    const superAdminName = 'System Administrator';

    // Create Firebase Auth user
    const { user } = await createUserWithEmailAndPassword(auth, superAdminEmail, superAdminPassword);
    console.log('Firebase Auth user created:', user.uid);

    // Create user document in Firestore
    const userDoc = {
      name: superAdminName,
      email: superAdminEmail,
      role: 'super-admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);
    console.log('Super admin document created in Firestore');

    console.log('✅ Super admin setup completed successfully!');
    console.log('Email:', superAdminEmail);
    console.log('Password:', superAdminPassword);
    console.log('Access the super admin portal at: /superadmin-login');
    
    // Sign out
    await auth.signOut();
    
  } catch (error) {
    console.error('❌ Error setting up super admin:', error);
    if (error.code === 'auth/email-already-in-use') {
      console.log('Super admin account already exists');
    }
  }
}

// Run the setup
setupSuperAdmin(); 