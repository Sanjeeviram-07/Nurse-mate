const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyCzDB9xVuVq_tishkgMQtoEOMiyaKFTZ2c",
    authDomain: "nurse-mate-63ec1.firebaseapp.com",
    projectId: "nurse-mate-63ec1",
    storageBucket: "nurse-mate-63ec1.firebasestorage.app",
    messagingSenderId: "160454707154",
    appId: "1:160454707154:web:91d9d2cbd75c3e700baa0b"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function addSuperAdmin() {
  try {
    const superAdminEmail = 'admin@nursemate.com';
    const superAdminPassword = 'Admin123!';
    const superAdminName = 'System Administrator';

    console.log('🔧 Adding new super admin...');
    console.log('Email:', superAdminEmail);
    console.log('Password:', superAdminPassword);

    // Create Firebase Auth user
    const { user } = await createUserWithEmailAndPassword(auth, superAdminEmail, superAdminPassword);
    console.log('✅ Firebase Auth user created successfully!');
    console.log('User ID:', user.uid);

    // Create user document in Firestore
    const userDoc = {
      name: superAdminName,
      email: superAdminEmail,
      role: "super-admin",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, "users", user.uid), userDoc);
    console.log('✅ Firestore user document created successfully!');

    console.log('\n🎉 Super admin setup completed successfully!');
    console.log('📧 Email:', superAdminEmail);
    console.log('🔑 Password:', superAdminPassword);
    console.log('🔗 Access the super admin portal at: /superadmin-login');
    console.log('👤 User ID:', user.uid);

    await auth.signOut();
    console.log('✅ Signed out successfully');

  } catch (error) {
    console.error('❌ Error adding super admin:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  Super admin account already exists');
      console.log('You can use these credentials to log in:');
      console.log('Email: admin@nursemate.com');
      console.log('Password: Admin123!');
    } else if (error.code === 'auth/weak-password') {
      console.log('❌ Password is too weak. Please use a stronger password.');
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
}

addSuperAdmin(); 