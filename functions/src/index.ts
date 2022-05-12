import * as functions from "firebase-functions";
import * as moment from 'moment';
import * as express from 'express';
import { writeBatch, doc, getFirestore } from "firebase/firestore";

const cors = require('cors')({ origin: true });
const { firebaseHelper } = require('firebase-functions-helper');

import * as serviceAccount from './aquacosm-data-firebase-adminsdk-z49ge-7b576d58d6.json';
import {  } from '@angular/fire/firestore';
const app = firebaseHelper.initializeApp(serviceAccount);
const db = getFirestore(app);

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.dataWebhook = functions.https.onRequest((req: express.Request, res: express.Response) => {
  (async () => {
    if (req.method === 'OPTIONS') {
      cors(req, res, () => {
        res.status(200).send();
      });
    } else {
      try {
        const data: DataObject[] = req.body;

        let mesocosmDataFrames: MesocosmDataFrame[] = [];

        data.forEach(dataObject => {
          const data = mapDataObjectToMesocosmDataFrames(dataObject, [ 'Limnotron 1' ]);
          mesocosmDataFrames = mesocosmDataFrames.concat(data);
        });

        console.log(mesocosmDataFrames);

        const batch = writeBatch(db);

        mesocosmDataFrames.forEach(dataFrame => {
          console.log(dataFrame);
          const ref = doc(db, 'data', dataFrame.id);
          batch.set(ref, dataFrame);
        });

        await batch.commit();

        cors(req, res, () => {
          res.status(200).send();
        });
      } catch (error) {
        console.log(error);
        cors(req, res, () => {
          res.status(400).send({data: {error: error}});
        });
      }
    }
  })();
});

function mapDataObjectToMesocosmDataFrames(dataObject: DataObject, mesocosms: string[]): MesocosmDataFrame[] {
  return mesocosms.map(mesocosmId => mapDataObjectToMesocosmDataFrame(dataObject, mesocosmId))
}

function mapDataObjectToMesocosmDataFrame(dataObject: DataObject, mesocosm: string): MesocosmDataFrame {
  return {
    id: mesocosm,
    depth: +dataObject['K1-D.Measured Value'].replace(/,/g, '.'),
    temperature: +dataObject[ `K1-O2T.Measured Value` ].replace(/,/g, '.'),
    light: +dataObject[ `Light 1` ].replace(/,/g, '.'),
    oxygen: +dataObject[ `Oxygen 1` ].replace(/,/g, '.'),
    time: moment(dataObject.Time, 'DD/MM/YYYY HH:mm:ss').toDate()
  }
}

interface DataObject {
  Time: string;
  'K1-D.Measured Value': string;
  'K1-O2T.Measured Value': string;
  'K1-L.Measured Value': string;
  'K1-O2.Measured Value': string;
  'Light 1': string;
  'Oxygen 1': string;
}

interface MesocosmDataFrame {
  id: string;
  time: Date;
  depth: number;
  temperature: number;
  light: number;
  oxygen: number;
}
