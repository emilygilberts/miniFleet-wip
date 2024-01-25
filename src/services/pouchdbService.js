import PouchDB from "pouchdb-browser";
import jsonpatch from "fast-json-patch";

const initializePouchDB = (dbName) => {
  return new PouchDB(dbName);
};
const getAllDocs = async (db) => {
  const allDocs = await db.allDocs({ include_docs: true, conflicts: true });

  const docs = allDocs.rows
    .filter((row) => {
      const doc = row.doc;
      // check if there is a conflict in the remote db
      if (doc._conflicts) {
        console.log("Doc has conflicts:", doc._conflicts);
        handleConflicts(db, doc);
        //return doc would return the "winning version" to the list of items
        return false; // exclude documents with conflicts from the list
      }
      return !row.id.startsWith("_design/");
    })
    .map((row) => row.doc);
  return docs;
};
const handleConflicts = async (db, doc) => {
  console.log("handling conflict...");
  //get conflicting versions
  const conflictingDocs = await Promise.all(
    doc._conflicts.map(async (conflictRevision) => {
      return await db.get(doc._id, { rev: conflictRevision });
    })
  );
  document.dispatchEvent(
    new CustomEvent("conflict-detected", {
      detail: {
        originalDoc: doc,
        conflictingVersions: conflictingDocs,
      },
    })
  );
};
const postDoc = async (db, doc) => {
  const addition = await db.post(doc);
  return addition.ok ? addition : null;
};
const putDoc = async (db, doc) => {
  //get previously stored version of the document
  const oldDoc = await db.get(doc._id);
  // get JSON Patch from new version to old version!
  const patch = jsonpatch.compare(doc, oldDoc);
  // add the patch to the start of the history array
  doc.history = doc.history || [];
  doc.history.unshift(patch);
  const update = await db.put(doc);
  return update.ok ? update : null;
};
const removeDoc = async (db, doc) => {
  const removal = await db.remove(doc);
  return removal.ok ? removal : null;
};

export { initializePouchDB, getAllDocs, postDoc, putDoc, removeDoc };
