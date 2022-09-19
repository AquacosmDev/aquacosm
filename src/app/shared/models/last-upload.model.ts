import firebase from 'firebase/compat';
import Timestamp = firebase.firestore.Timestamp;

export interface LastUpload {
  partnerId: string;
  date: Timestamp;
}
