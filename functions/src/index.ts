import * as functions from "firebase-functions";
import * as moment from 'moment-timezone';
import * as express from 'express';
import { sum, std } from 'mathjs'

const cors = require('cors')({ origin: true });
const { firebaseHelper, firestoreHelper } = require('firebase-functions-helper');

import * as serviceAccount from './aquacosm-data-firebase-adminsdk-z49ge-7b576d58d6.json';
const app = firebaseHelper.initializeApp(serviceAccount);
const db = app.firestore;
db.settings({ timestampsInSnapshots: true });
moment.tz.setDefault('Europe/Amsterdam');

const _WINDOW = 30;

exports.dataWebhook = functions
  .runWith({
    // Ensure the function has enough memory and time
    // to process large files
    timeoutSeconds: 500,
    memory: "1GB",
  })
  .https.onRequest((req: express.Request, res: express.Response) => {
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
                mesocosmData = createNewDay(variable.id!, mesocosm.id!, day)
              } else {
                mesocosmData = FBOtoObject<MesocosmData>(mesocosmsDataFBO)[0];
              }
              for (const dataMeasurement of dayData) {
                let timePoint = mesocosmData.data[ getMinuteOfDay(getDateDataObject(dataMeasurement)) ];

                if (!timePoint.value) {
                  timePoint.value = dataMeasurement[mesocosm.dataMapping[variable.id!]] ?
                    +(dataMeasurement[mesocosm.dataMapping[variable.id!]].replace(/,/g, '.')) :
                    null;

                  timePoint = await getMetrics(timePoint, mesocosmData);
                  mesocosmData.data[ timePoint.minuteOfDay! ] = timePoint;
                }
              }
              if (typeof mesocosmsDataFBO === 'string') {
                await firestoreHelper.createNewDocument(db, 'mesocosmData', mesocosmData);
              } else {
                await firestoreHelper.updateDocument(db, 'mesocosmData', mesocosmData.id, mesocosmData);
              }

              const lastUploadFBO = await firestoreHelper.queryData(db, 'lastUpload', queryArray);
              let lastUpload = FBOtoObject<LastUpload>(lastUploadFBO)[0];
              lastUpload.date = getLastHour();
              await firestoreHelper.updateDocument(db, 'lastUpload', lastUpload.id, lastUpload);
            }
          }
        }

        cors(req, res, () => {
          res.status(200).send();
        });
      } catch (error: any) {
        console.error(error);
        // const errorFBO: FBOError = {
        //   error: error,
        //   partner: req.body.partner,
        //   object: req.body.data
        // }
        // await firestoreHelper.createNewDocument(db, 'error', errorFBO);
        cors(req, res, () => {
          res.status(400).send({data: {error: error}});
        });
      }
    }
  })();
});

// exports.deleteData = functions
//   .https.onRequest((req: express.Request, res: express.Response) => {
//     (async () => {
//       if (req.method === 'OPTIONS') {
//         cors(req, res, () => {
//           res.status(200).send();
//         });
//       } else {
//         try {
//           const batch = db.batch()
//
//           await db.collection('mesocosmData').listDocuments().then((val: any[]) => {
//             val = val.slice(0, 100);
//             val.map((val) => {
//               batch.delete(val)
//             });
//           });
//
//           await batch.commit();
//
//           cors(req, res, () => {
//             res.status(200).send();
//           });
//         } catch (error: any) {
//           console.error(error);
//           cors(req, res, () => {
//             res.status(400).send({data: {error: error}});
//           });
//         }
//       }
//     })();
//   });

function createNewDay(variableId: string, mesocosmId: string, day: number): MesocosmData {
  return {
    variableId: variableId,
    mesocosmId: mesocosmId,
    day: day,
    data: createTimePointsForDay(day)
  };
}

function createTimePointsForDay(day: number): TimePoint[] {
  let startDate = moment(moment(day, 'YYYYMMDD')).startOf('day');
  const endDate = moment(moment(day, 'YYYYMMDD')).endOf('day');

  const timePoints: TimePoint[] = [];
  while (moment(startDate).isSameOrBefore(endDate)) {
    timePoints.push({
      minuteOfDay: getMinuteOfDay(startDate.toDate()),
      time: startDate.toDate(),
      value: null
    });
    startDate = startDate.add(1, 'minute');
  }

  return timePoints;
}

function getMinuteOfDay(date: Date): number {
  return moment(date).hour() * 60 + moment(date).minute();
}

function getDayNumber(date: Date): number {
  return parseInt(moment(date).format('YYYYMMDD'), 0);
}

function getDateDataObject(dataObject: any): Date {
  return moment(dataObject.Time, 'DD/MM/YYYY HH:mm:ss').toDate();
}

function getDayNumberFromYesterday(day: number): number {
  return getDayNumber(moment(day, 'YYYYMMDD').add(-1, 'day').toDate());
}

function getLastHour(): Date {
  return moment(new Date()).set({ minutes: 0, seconds: 0, milliseconds: 0 }).toDate();
}

function FBOtoObject<T>(FBO: { [id: string]: T }): T[] {
  return Object.keys(FBO).map(id => {
    const object = FBO[ id ];
    (object as any).id = id;
    return object;
  });
}

async function getMetrics(timePoint: TimePoint, mesocosmData: MesocosmData) {
  if(timePoint.minuteOfDay! < _WINDOW) {

    const yesterday = getDayNumberFromYesterday(mesocosmData.day);
    const queryArrayMesocosmDataYesterday = [
      ['variableId', '==', mesocosmData.variableId],
      ['mesocosmId', '==', mesocosmData.mesocosmId],
      ['day', '==', yesterday]];
    let yesterdayMesocosmDataFBO = await firestoreHelper.queryData(db, 'mesocosmData', queryArrayMesocosmDataYesterday);
    let yesterdayMesocosmData: MesocosmData;

    if (typeof yesterdayMesocosmDataFBO === 'string') {
      timePoint.rollingAverage = timePoint.value;
      timePoint.standardDeviation = 0;
    } else {
      yesterdayMesocosmData = FBOtoObject<MesocosmData>(yesterdayMesocosmDataFBO)[0];
      timePoint = getMetricsForTodayAndYesterday(mesocosmData, yesterdayMesocosmData, timePoint);
    }
  } else {
    timePoint = getMetricsForToday(mesocosmData, timePoint);
  }
  return timePoint;
}

function getMetricsForToday(today: MesocosmData, timePoint: TimePoint): TimePoint {
  const windowSlice = today.data.slice(timePoint.minuteOfDay! - _WINDOW, timePoint.minuteOfDay!);
  return setMetrics(timePoint, windowSlice);
}

function getMetricsForTodayAndYesterday(today: MesocosmData, yesterday: MesocosmData, timePoint: TimePoint): TimePoint {
  const timePointsNeededFromYesterday = _WINDOW - timePoint.minuteOfDay!;
  const windowSliceYesterday = yesterday.data.slice(yesterday.data.length - timePointsNeededFromYesterday);
  const windowSliceToday = today.data.slice(0, timePoint.minuteOfDay!);
  const windowSlice = windowSliceToday.concat(windowSliceYesterday);
  return setMetrics(timePoint, windowSlice);
}

function calculateRollingAverage(slice: TimePoint[]): number | null {
  const sumOfData = slice.length > 0 ? sum(slice.map(timePoint => timePoint.value!)) : null ;
  return sumOfData !== null ? sumOfData / slice.length : sumOfData;
}

function setMetrics(timePoint: TimePoint, slice: TimePoint[]): TimePoint {
  slice = slice.filter(timePoint => timePoint.value !== null);
  timePoint.rollingAverage = calculateRollingAverage(slice);
  // @ts-ignore
  timePoint.standardDeviation = slice.length > 0 ? std(slice.map(timePoint => timePoint.value!)) : null;
  return timePoint;
}

// interface FBOError {
//   id?: string;
//   error: string;
//   partner: string;
//   object: any;
// }

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
  minuteOfDay?: number;
  time: Date;
  value: number | null;
  rollingAverage?: number | null;
  standardDeviation?: number | null;
}

interface LastUpload {
  id: string;
  partnerId: string;
  date: Date;
}
