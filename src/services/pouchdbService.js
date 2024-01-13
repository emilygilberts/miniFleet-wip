import PouchDB from "pouchdb-browser";

const initializePouchDB = (dbName) => {
  return new PouchDB(dbName);
};
const getAllDocs = async (db) => {
  const allDocs = await db.allDocs({ include_docs: true });
  const docs = allDocs.rows
    .filter((row) => !row.id.startsWith("_design/"))
    .map((row) => row.doc);
  return docs;
};
const postDoc = async (db, doc) => {
  const addition = await db.post(doc);
  return addition.ok ? addition : null;
};
const putDoc = async (db, doc) => {
  const update = await db.put(doc);
  return update.ok ? update : null;
};
const removeDoc = async (db, doc) => {
  const removal = await db.remove(doc);
  return removal.ok ? removal : null;
};

export { initializePouchDB, getAllDocs, postDoc, putDoc, removeDoc };
