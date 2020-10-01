export const s3Prefix =
  'https://s3.us-east-2.amazonaws.com/cfdnadb.epifluidlab.cchmc.org/entries';

export const s3Bucket =
  process.env.REACT_APP_STATIC_FILES_PREFIX ||
  'https://s3.us-east-2.amazonaws.com/cfdnadb.epifluidlab.cchmc.org';

export const showBAM = false;

console.log(process.env);

export const defaultSeqrunQueryTerms = {
  search: '',
  assay: [],
  enableReadlen: false,
  minReadlen: 10,
  maxReadlen: 160,
  enableFragNum: false,
  minFragNum: 10e6,
  maxFragNum: 100e6,
  tissue: [],
  disease: [],
  instrument: [],
  publication: [],
  offset: 0,
}