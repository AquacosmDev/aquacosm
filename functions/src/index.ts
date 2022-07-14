import * as functions from "firebase-functions";
import * as moment from 'moment-timezone';
import * as express from 'express';

const cors = require('cors')({ origin: true });
const { firebaseHelper, firestoreHelper } = require('firebase-functions-helper');

import * as serviceAccount from './aquacosm-data-firebase-adminsdk-z49ge-7b576d58d6.json';
import { firestore } from 'firebase-admin';
const app = firebaseHelper.initializeApp(serviceAccount);
const db = app.firestore;
db.settings({ timestampsInSnapshots: true });

exports.dataWebhook = functions.https.onRequest((req: express.Request, res: express.Response) => {
  (async () => {
    if (req.method === 'OPTIONS') {
      cors(req, res, () => {
        res.status(200).send();
      });
    } else {
      try {
        if (!req.body.partnerName) {
          throw Error('No partner name submitted');
        }

        const queryArrayPartner = [['name', '==', req.body.partnerName ]];
        let partner = await firestoreHelper.queryData(db, 'partner', queryArrayPartner);

        if (typeof partner === 'string') {
          throw Error('Partner does not exist');
        }

        partner = FBOtoObject<Partner>(partner)[ 0 ];

        const data: { [name: string]: string }[] = JSON.parse(req.body.data);

        const queryArray = [['partnerId', '==', partner.id ]];
        const variablesFBO = await firestoreHelper.queryData(db, 'variable', queryArray);
        const variables = FBOtoObject<Variable>(variablesFBO);

        const mesocosmsFBO = await firestoreHelper.queryData(db, 'mesocosm', queryArray);
        const mesocosms = FBOtoObject<Mesocosm>(mesocosmsFBO);

        for (const mesocosm of mesocosms) {
          for (const variable of variables) {
            const days = data.map(dataMeasurement => getDayNumber(getDateDataObject(dataMeasurement)))
              .filter((v, i, a) => a.indexOf(v) === i);

            for (const day of days) {
              const dayData = data.filter(dataMeasurement => getDayNumber(getDateDataObject(dataMeasurement)) === day)
              const queryArrayMesocosmData = [
                ['variableId', '==', variable.id],
                ['mesocosmId', '==', mesocosm.id],
                ['day', '==', day]];
              let mesocosmsDataFBO = await firestoreHelper.queryData(db, 'mesocosmData', queryArrayMesocosmData);
              let mesocosmData: MesocosmData;


              if (typeof mesocosmsDataFBO === 'string') {
                mesocosmsDataFBO = {
                  variableId: variable.id!,
                  mesocosmId: mesocosm.id!,
                  day: day,
                  data: dayData.map(dataMeasurement => {
                    const value = dataMeasurement[mesocosm.dataMapping[variable.id!]] ?
                      +(dataMeasurement[mesocosm.dataMapping[variable.id!]].replace(/,/g, '.')) :
                      null;
                    return {time: getDateDataObject(dataMeasurement), value: value}
                  })
                }
                await firestoreHelper.createNewDocument(db, 'mesocosmData', mesocosmsDataFBO);
              } else {
                mesocosmData = FBOtoObject<MesocosmData>(mesocosmsDataFBO)[0];
                for (const dataMeasurement of dayData) {
                  const oldTimePoints = mesocosmData.data;
                  if (!oldTimePoints.some(timePoint => !!timePoint && (timePoint.time instanceof firestore.Timestamp) &&
                    isSameDate(dataMeasurement, (timePoint.time as any).toDate()))) {
                    const value = dataMeasurement[mesocosm.dataMapping[variable.id!]] ?
                      +(dataMeasurement[mesocosm.dataMapping[variable.id!]].replace(/,/g, '.')) :
                      null;

                    mesocosmData.data.push({
                      time: getDateDataObject(dataMeasurement),
                      value: value
                    });
                    await firestoreHelper.updateDocument(db, 'mesocosmData', mesocosmData.id, mesocosmData);
                  }
                }
              }
            }
          }
        }

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

function getDayNumber(date: Date): number {
  return parseInt(moment(date).format('YYYYMMDD'), 0);
}

function getDateDataObject(dataObject: any): Date {
  return moment(dataObject.Time, 'DD/MM/YYYY HH:mm:ss').tz('Europe/Amsterdam').toDate();
}

function isSameDate(dataObject: any, newDate: Date): boolean {
  return moment(dataObject.Time, 'DD/MM/YYYY HH:mm:ss').tz('Europe/Amsterdam').isSame(newDate, 'minute');
}

function FBOtoObject<T>(FBO: { [id: string]: T }): T[] {
  return Object.keys(FBO).map(id => {
    const object = FBO[ id ];
    (object as any).id = id;
    return object;
  });
}

interface Partner {
  id?: string;
  name: string;
  displayName: string;
  logo: string;
}

interface Variable {
  id?: string;
  name: string;
  partnerId: string;
}

interface Mesocosm {
  id?: string;
  name: string;
  partnerId: string;
  dataMapping: { [variableId: string]: string }
}

interface MesocosmData {
  id?: string;
  variableId: string;
  mesocosmId: string;
  data: TimePoint[];
  day: number
}

interface TimePoint {
  time: Date;
  value: number | null;
}
