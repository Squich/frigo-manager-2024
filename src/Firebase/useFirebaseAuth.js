import { useState, useEffect } from 'react';
import { auth, db } from './Firebase/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updateEmail, updatePassword, deleteUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const useFirebaseAuth = () => {
	const [user, setUser] = useState(null);

	// Effectue l'écoute des changements d'état d'authentification
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, user => {
			if (user) {
				setUser(user);
			} else {
				setUser(null);
			}
		});

		return () => unsubscribe();
	}, []);

	// Fonction pour inscrire un nouvel utilisateur
	const signUp = async (email, password) => {
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			setUser(userCredential.user);
			await setDoc(doc(db, 'users', userCredential.user.uid), { email });
		} catch (error) {
			console.error("Erreur lors de l'inscription :", error);
		}
	};

	// Fonction pour connecter un utilisateur existant
	const signIn = async (email, password) => {
		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			setUser(userCredential.user);
		} catch (error) {
			console.error('Erreur lors de la connexion :', error);
		}
	};

	// Fonction pour déconnecter l'utilisateur
	const signOutUser = async () => {
		try {
			await signOut(auth);
			setUser(null);
		} catch (error) {
			console.error('Erreur lors de la déconnexion :', error);
		}
	};

	// Fonction pour réinitialiser le mot de passe de l'utilisateur
	const resetPassword = async email => {
		try {
			await sendPasswordResetEmail(auth, email);
		} catch (error) {
			console.error('Erreur lors de la réinitialisation du mot de passe :', error);
		}
	};

	// Fonction pour mettre à jour l'email de l'utilisateur
	const updateEmailUser = async newEmail => {
		try {
			if (user) {
				await updateEmail(user, newEmail);
				await setDoc(doc(db, 'users', user.uid), { email: newEmail }, { merge: true });
			}
		} catch (error) {
			console.error("Erreur lors de la mise à jour de l'email :", error);
		}
	};

	// Fonction pour mettre à jour le mot de passe de l'utilisateur
	const updatePasswordUser = async newPassword => {
		try {
			if (user) {
				await updatePassword(user, newPassword);
			}
		} catch (error) {
			console.error('Erreur lors de la mise à jour du mot de passe :', error);
		}
	};

	// Fonction pour supprimer l'utilisateur
	const deleteUserAccount = async () => {
		try {
			if (user) {
				await deleteUser(user);
				await deleteDoc(doc(db, 'users', user.uid));
				setUser(null);
			}
		} catch (error) {
			console.error('Erreur lors de la suppression du compte :', error);
		}
	};

	// Fonction pour récupérer les données de l'utilisateur
	const getUserData = async () => {
		try {
			if (user) {
				const userDoc = await getDoc(doc(db, 'users', user.uid));
				if (userDoc.exists()) {
					return userDoc.data();
				} else {
					console.error('Aucune donnée utilisateur trouvée');
				}
			}
		} catch (error) {
			console.error('Erreur lors de la récupération des données utilisateur :', error);
		}
	};

	// Fonction pour récupérer le profil de l'utilisateur
	const getUserProfile = async () => {
		try {
			if (user) {
				const userProfileDoc = await getDoc(doc(db, 'userProfiles', user.uid));
				if (userProfileDoc.exists()) {
					return userProfileDoc.data();
				} else {
					console.error('Aucune donnée de profil utilisateur trouvée');
				}
			}
		} catch (error) {
			console.error('Erreur lors de la récupération des données du profil utilisateur :', error);
		}
	};

	// Fonction pour récupérer le document Firestore d'un utilisateur
	const getUserFirestoreDoc = async uid => {
		try {
			const userDoc = await getDoc(doc(db, 'users', uid));
			if (userDoc.exists()) {
				return userDoc.data();
			} else {
				console.error('Aucun document utilisateur trouvé');
			}
		} catch (error) {
			console.error('Erreur lors de la récupération du document utilisateur :', error);
		}
	};

	// Fonction pour supprimer le document Firestore associé à un utilisateur
	const deleteUserFirestoreDoc = async uid => {
		try {
			await deleteDoc(doc(db, 'users', uid));
		} catch (error) {
			console.error('Erreur lors de la suppression du document utilisateur :', error);
		}
	};

	return {
		user,
		signUp,
		signIn,
		signOutUser,
		resetPassword,
		updateEmailUser,
		updatePasswordUser,
		deleteUserAccount,
		getUserData,
		getUserProfile,
		getUserFirestoreDoc,
		deleteUserFirestoreDoc,
	};
};

export default useFirebaseAuth;
