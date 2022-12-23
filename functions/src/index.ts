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
const _LIMNOTRONS: { [ id: string]: string } = {
  'wqaNxEBtsZGwqeYw9viA': 'Profile run 1',
  'wRtirZIbpTtjbn4yGjv0': 'Profile run 2',
  'xDLIEl6DALUVuvaC0IVb': 'Profile run 3',
  'vgjmqtVdZSPgfrSoTXyv': 'Profile run 4',
  'aFEOqpfMet44Yqug1sVf': 'Profile run 5',
  'd765Uy6PLJcwch2xyTxQ': 'Profile run 6',
  'CbWXyGaVMlpB5LisQ7WO': 'Profile run 7',
  'YJLWk2Ftb5RyOdTRGKsZ': 'Profile run 8',
  'EqLtdrsCpAD4qFe6OgcT': 'Profile run 9',
}

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

        functions.logger.log("Function initialized with: ", req.body);

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
                mesocosmData.data.forEach(timepoint => {
                  timepoint.time = (timepoint.time as any).toDate();
                })
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

                if (isLastMinute(timePoint.time)) {
                  const firstValueTimePoint = mesocosmData.data.filter(timePoint => timePoint.value !== null)[ 0 ];
                  await addToYearData(variable.id!, mesocosm.id!, firstValueTimePoint);
                }
              }
              if (typeof mesocosmsDataFBO === 'string') {
                await firestoreHelper.createNewDocument(db, 'mesocosmData', mesocosmData);
              } else {
                await firestoreHelper.updateDocument(db, 'mesocosmData', mesocosmData.id, mesocosmData);
              }

              const lastUploadFBO = await firestoreHelper.queryData(db, 'lastUpload', queryArray);
              let lastUpload = FBOtoObject<LastUpload>(lastUploadFBO)[0];
              if (isBefore(lastUpload.date, getLastHour())) {
                lastUpload.date = getLastHour();
              }
              await firestoreHelper.updateDocument(db, 'lastUpload', lastUpload.id, lastUpload);
            }
          }
          functions.logger.log("Completed mesocosm: ", mesocosm.name);
        }

        cors(req, res, () => {
          res.status(200).send();
        });
      } catch (error: any) {
        functions.logger.error(error.stackTrace, error);
        cors(req, res, () => {
          res.status(400).send({data: {error: error}});
        });
      }
    }
  })();
});

exports.profileWebhook = functions
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

          const variableMesocosms = createMesocosmVariableIds(mesocosms, variables);

          const profile = createNewProfile(partner.id, getDateFromString((data[ 0 ] as any).Time));
          if (req.body.partnerName === 'NIOOLimnotrons') {
            profile.mesocosms = createMesocosmsRunOverview(data[ 0 ]);
          }
          profile.data = data.map(timeData => createProfileData(timeData, variableMesocosms));

          await firestoreHelper.createNewDocument(db, 'profile', profile);
          functions.logger.log("Profile completed");

          cors(req, res, () => {
            res.status(200).send();
          });
        } catch (error: any) {
          functions.logger.error(error.stackTrace, error);
          cors(req, res, () => {
            res.status(400).send({data: {error: error}});
          });
        }
      }
    })();
  });

function createNewDay(variableId: string, mesocosmId: string, day: number): MesocosmData {
  return {
    variableId: variableId,
    mesocosmId: mesocosmId,
    day: day,
    data: createTimePointsForDay(day)
  };
}

function createNewYear(variableId: string, mesocosmId: string, year: number): MesocosmYearData {
  return {
    variableId: variableId,
    mesocosmId: mesocosmId,
    year: year,
    data: []
  };
}

async function addToYearData(variableId: string, mesocosmId: string, timepoint: TimePoint) {
  functions.logger.log('Add to year started.');
  const year = getYear(timepoint.time);
  const queryArray = [
    ['variableId', '==', variableId],
    ['mesocosmId', '==', mesocosmId],
    ['year', '==', year]];
  let mesocosmYearDataFBO = await firestoreHelper.queryData(db, 'mesocosmYearData', queryArray);
  let mesocosmYearData: MesocosmYearData;

  if (typeof mesocosmYearDataFBO === 'string') {
    mesocosmYearData = createNewYear(variableId, mesocosmId, year)
  } else {
    mesocosmYearData = FBOtoObject<MesocosmYearData>(mesocosmYearDataFBO)[0];
  }
  timepoint.time = setToMidday(timepoint.time);
  mesocosmYearData.data.push(timepoint);

  if (typeof mesocosmYearDataFBO === 'string') {
    await firestoreHelper.createNewDocument(db, 'mesocosmYearData', mesocosmYearData);
  } else {
    await firestoreHelper.updateDocument(db, 'mesocosmYearData', mesocosmYearData.id, mesocosmYearData);
  }
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

function getYear(date: Date): number {
  return moment(date).year();
}

function getMinuteOfDay(date: Date): number {
  return moment(date).hour() * 60 + moment(date).minute();
}

function getDayNumber(date: Date): number {
  return parseInt(moment(date).format('YYYYMMDD'), 0);
}

function getDateDataObject(dataObject: any): Date {
  return getDateFromString(dataObject.Time);
}

function getDateFromString(date: string): Date {
  return moment(date, 'DD/MM/YYYY HH:mm:ss').toDate();
}

function getDayNumberFromYesterday(day: number): number {
  return getDayNumber(moment(day, 'YYYYMMDD').add(-1, 'day').toDate());
}

function getLastHour(): Date {
  return moment(new Date()).set({ minutes: 0, seconds: 0, milliseconds: 0 }).toDate();
}

function isBefore(date: Date, newDate: Date): boolean {
  return moment(date).isBefore(newDate, 'hour');
}

function setToMidday(date: Date): Date {
  return moment(date).set({ hours: 12, minutes: 0, seconds: 0, milliseconds: 0 }).toDate();
}

function isLastMinute(date: Date) : boolean {
  return moment(date).hour() === 23 && moment(date).minute() === 59;
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

function createNewProfile(partnerId: string, startTime: Date): Profile {
  return {
    partnerId: partnerId,
    startTime: startTime,
    data: []
  }
}

function createMesocosmVariableIds(mesocosms: Mesocosm[], variables: Variable[]): VariableMesocosm[] {
  const ids: VariableMesocosm[] = [];
  mesocosms.forEach(mesocosm =>  variables.forEach(variable => ids.push({
    id: variable.id! + mesocosm.id!,
    mapping: mesocosm.dataMapping[variable.id!]
  })));
  return ids;
}

function createProfileData(data: any, variableMesocosmIds: VariableMesocosm[]): ProfileData {
  const profileData: ProfileData = {
    time: getDateDataObject(data)
  };
  variableMesocosmIds.forEach(object => {
    profileData[ object.id ] = data[ object.mapping ] ?
      +(data[ object.mapping ].replace(/,/g, '.')) :
      null;
  });
  return profileData;
}

function createMesocosmsRunOverview(data: any): string[] {
  return Object.keys(_LIMNOTRONS).filter(mesocosmId => data[ _LIMNOTRONS[ mesocosmId ]].toLowerCase() === 'on');
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
  day: number;
}

interface MesocosmYearData {
  id?: string;
  variableId: string;
  mesocosmId: string;
  data: TimePoint[];
  year: number;
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

interface Profile {
  id?: string;
  partnerId: string;
  startTime: Date;
  mesocosms?: string[];
  data: ProfileData[]
}

interface ProfileData {
  time: Date;
  [ value: string ]: number | null | Date;
}

interface VariableMesocosm {
  id: string;
  mapping: string;
}
