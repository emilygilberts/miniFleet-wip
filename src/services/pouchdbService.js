import PouchDB from "pouchdb-browser";
import jsonpatch from "fast-json-patch";
import { arraysHaveSameElements, excludeFields } from "@/utils.js";
const fields_to_exclude = ["_conflicts", "_rev", "history"];
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
  //get conflicting versions
  const conflictingDocs = await getConflictingVersions(db, doc);
  //TODO: handle multiple conflicting docs
  const firstConflictingDoc = conflictingDocs[0];
  const { previousDocThis, previousDocConflict } = getPreviousRevisions(
    doc,
    firstConflictingDoc
  );
  if (isSamePreviousRevision(previousDocThis, previousDocConflict)) {
    console.log("same revision, lets check the paths");
    handleAutoMerge(db, doc, firstConflictingDoc, previousDocThis);
  } else {
    console.log("dont have same prev version - handle manually");
    handleManualMerge(db, doc, firstConflictingDoc);
  }
};

const getPreviousRevisions = (doc, conflictingDoc) => {
  //recreate old revision by applying latest patches from history
  // const fields_to_exclude = ["_conflicts", "_rev", "history"];
  //apply the patch and set mutateDocument to false to not apply the patch to the document directly
  const previousDocThis = jsonpatch.applyPatch(
    excludeFields(doc, fields_to_exclude),
    doc.history[0],
    undefined,
    false
  ).newDocument;
  const previousDocConflict = jsonpatch.applyPatch(
    excludeFields(conflictingDoc, fields_to_exclude),
    conflictingDoc.history[0],
    undefined,
    false
  ).newDocument;
  return { previousDocThis, previousDocConflict };
};

const isSamePreviousRevision = (previousRevThis, previousRevConflict) => {
  return (
    JSON.stringify(previousRevThis) === JSON.stringify(previousRevConflict)
  );
};

const getConflictingVersions = async (db, doc) => {
  return await Promise.all(
    doc._conflicts.map(async (conflictRevision) => {
      return await db.get(doc._id, { rev: conflictRevision });
    })
  );
};

const handleAutoMerge = (db, doc, conflictingDoc, previousDocThis) => {
  //if last history produced same revision get the patches to the current versions
  const patchToCurrent = jsonpatch.compare(
    previousDocThis,
    excludeFields(doc, fields_to_exclude)
  );
  const patchToConflict = jsonpatch.compare(
    previousDocThis,
    excludeFields(conflictingDoc, fields_to_exclude)
  );
  //check if the patches include the same paths (changed the same fields)
  const haveSamePaths = arraysHaveSameElements(
    patchToCurrent.map((item) => item.path),
    patchToConflict.map((item) => item.path)
  );

  if (haveSamePaths) {
    console.log("Changed same fields - handle manually");
    handleManualMerge(db, doc, conflictingDoc);
  } else {
    //if patches don't have the same paths they can be merged automatically
    //apply changes made in conflicting doc to current doc
    const patchedDoc = jsonpatch.applyPatch(
      doc,
      patchToConflict,
      undefined,
      false
    ).newDocument;
    //and save the backwards patch to add to the history
    const patch = jsonpatch.compare(patchedDoc, doc);
    console.log("Doc with both patches applied", patchedDoc);
    putMergedDoc(db, patchedDoc, patch, conflictingDoc._rev);
  }
};
const handleManualMerge = (db, doc, conflictingDoc) => {
  document.dispatchEvent(
    new CustomEvent("conflict-detected", {
      detail: {
        db: db,
        originalDoc: doc,
        conflictingVersion: conflictingDoc,
      },
    })
  );
};

const resolveConflictedDoc = async (db, doc, conflictingDocs, choice) => {
  if (choice === "mine") {
    console.log("user chose own changes");
  } else if (choice === "incoming") {
    console.log("user chose incoming changes");
  }
};

const postDoc = async (db, doc) => {
  const addition = await db.post(doc);
  return addition.ok ? addition : null;
};

const putMergedDoc = async (db, doc, patch1, conflictRev) => {
  // Add the patch to the document's history array
  doc.history[0] = [...doc.history[0], ...patch1];
  const update = await db.put(doc);
  const updatedDoc = await db.get(doc._id);
  console.log("Merged doc in db now looks like this ", updatedDoc);
  // if successfully updated remove conflicting revision otherwise endless loop
  if (update.ok) {
    const removed = db.remove(doc._id, conflictRev);
    console.log("Removed conflicting rev", conflictRev);
  }
  //TODO:
  //catch 409 conflict message (actually revision mismatch)
};

const putDoc = async (db, doc) => {
  const oldDoc = await db.get(doc._id);
  // Compute the JSON Patch from the new version to the old version!
  const patch = jsonpatch.compare(doc, oldDoc);
  // Add the patch to the front of the document's history array
  //if offline and unsynced changes- "squash history together" ?
  doc.history = doc.history || [];
  doc.history.unshift(patch);
  const update = await db.put(doc);
  return update.ok ? update : null;
};
const removeDoc = async (db, doc) => {
  const removal = await db.remove(doc);
  return removal.ok ? removal : null;
};

export {
  initializePouchDB,
  getAllDocs,
  postDoc,
  putDoc,
  removeDoc,
  resolveConflictedDoc,
};
