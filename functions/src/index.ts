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
        console.log(req.body);
        if (!req.body.partnerName) {
          throw Error('No partner name submitted');
        }

        const queryArrayPartner = [['name', '==', req.body.partnerName ]];
        let partner = await firestoreHelper.queryData(db, 'partner', queryArrayPartner);

        if (typeof partner === 'string') {
          throw Error('Partner does not exist');
        }

        partner = FBOtoObject<Partner>(partner)[ 0 ];

        const data: DataObject[] = JSON.parse(req.body.data);

        const queryArray = [['projectId', '==', partner.id ], [ 'month', '==', getMonthStringFromDataObject(data[ 0 ]) ]];
        const rawDataPerMonthsObject = await firestoreHelper.queryData(db, 'rawdata', queryArray);

        let rawDataPerMonth: RawDataPerMonth;

        if (typeof rawDataPerMonthsObject === 'string') {
          rawDataPerMonth = {
            partnerId: partner.id,
            month: getMonthStringFromDataObject(data[ 0 ]),
            data: data
          }
          await firestoreHelper.createNewDocument(db, 'rawdata', rawDataPerMonth);
        } else {
          const rawDataPerMonthList = FBOtoObject<RawDataPerMonth>(rawDataPerMonthsObject);
          rawDataPerMonth = addNewRawData(rawDataPerMonthList[ 0 ], data);

          await firestoreHelper.updateDocument(db, 'rawdata', rawDataPerMonth.id, rawDataPerMonth);
        }

        const queryArrayVariables = [['partnerId', '==', partner.id ]];
        const variablesFBO = await firestoreHelper.queryData(db, 'variable', queryArrayVariables);
        const variables = FBOtoObject<Variable>(variablesFBO);

        const queryArrayMesocosm = [['partnerId', '==', partner.id ]];
        const mesocosmsFBO = await firestoreHelper.queryData(db, 'mesocosm', queryArrayMesocosm);
        const mesocosms = FBOtoObject<Mesocosm>(mesocosmsFBO);

        for (const mesocosm of mesocosms) {
          for (const variable of variables) {
            const queryArrayMesocosmData = [['variableId', '==', variable.id ], ['mesocosmId', '==', mesocosm.id ]];
            let mesocosmsDataFBO = await firestoreHelper.queryData(db, 'mesocosmData', queryArrayMesocosmData);
            let mesocosmData: MesocosmData;

            if (typeof mesocosmsDataFBO === 'string') {
              mesocosmsDataFBO = {
                variableId: variable.id!,
                mesocosmId: mesocosm.id!,
                data: data.map(dataMeasurement => {
                  // @ts-ignore
                  const value = +(dataMeasurement[ mesocosm.dataMapping[ variable.id! ] ].replace(/,/g, '.'));
                  return { time: getDateDataObject(dataMeasurement), value: value }
                })
              }
              await firestoreHelper.createNewDocument(db, 'mesocosmData', mesocosmsDataFBO);
            } else {
              mesocosmData = FBOtoObject<MesocosmData>(mesocosmsDataFBO)[ 0 ];
              for (const dataMeasurement of data) {
                const oldTimePoints = mesocosmData.data;
                if (!oldTimePoints.some(timePoint => !!timePoint && (timePoint.time instanceof firestore.Timestamp) &&
                  isSameDate(dataMeasurement, (timePoint.time as any).toDate()))) {
                  // @ts-ignore
                  const value = +(dataMeasurement[ mesocosm.dataMapping[ variable.id! ] ].replace(/,/g, '.'));

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

function addNewRawData(rawDataPerMonth: RawDataPerMonth, newData: DataObject[]): RawDataPerMonth {
  newData.forEach(data => {
    if (!rawDataPerMonth.data.some(dataObject => dataObject.Time === data.Time)) {
      rawDataPerMonth.data.push(data);
    }
  })

  return rawDataPerMonth;
}

function getMonthStringFromDataObject(dataObject: DataObject): string {
  return moment(dataObject.Time, 'DD/MM/YYYY HH:mm:ss').tz('Europe/Amsterdam').format('MM-YYYY');
}

function getDateDataObject(dataObject: DataObject): Date {
  return moment(dataObject.Time, 'DD/MM/YYYY HH:mm:ss').tz('Europe/Amsterdam').toDate();
}

function isSameDate(dataObject: DataObject, newDate: Date): boolean {
  return moment(dataObject.Time, 'DD/MM/YYYY HH:mm:ss').tz('Europe/Amsterdam').isSame(newDate, 'minute');
}

function FBOtoObject<T>(FBO: { [id: string]: T }): T[] {
  return Object.keys(FBO).map(id => {
    const object = FBO[ id ];
    (object as any).id = id;
    return object;
  });
}

interface RawDataPerMonth {
  id?: string;
  partnerId: string;
  month: string;
  data: DataObject[];
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
}

interface TimePoint {
  time: Date;
  value: number;
}
