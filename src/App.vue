<template>
  <div id="app">
    <div class="update-dialog" v-if="updateExists">
      <p>New minifleet version available! Please update to load it :)</p>
      <div class="update-dialog-buttons">
        <button @click="updateAndRefresh">Update</button>
        <button @click="remindUpdate">Remind me later</button>
      </div>
    </div>
    <ConflictDialog
      v-if="conflictExists"
      :conflictDb="conflictDb"
      :winningVersionValues="winningVersionValues"
      :conflictingVersionValues="conflictingVersionValues"
      @choose-doc="handleChooseDoc"
      @cancel-conflict-dialog="cancelConflictDialog"
    />
    <div id="list">
      <LeftNav
        :items="items"
        :positions="positions"
        @addNewItem="addNewItem"
        @removeItem="removeItem"
        @addPosition="addPosition"
        @removePosition="removePosition"
        @updatedItem="editItem"
        @updatedPosition="editPosition"
      ></LeftNav>
    </div>
    <div id="map">
      <MapView :positions="positions" />
    </div>
  </div>
</template>

<script>
import MapView from "@/components/MapView.vue";
import LeftNav from "@/components/LeftNav.vue";
import ConflictDialog from "@/components/ConflictDialog.vue";
import PouchDB from "pouchdb-browser";
import { excludeFields } from "@/utils.js";
import {
  initializePouchDB,
  getAllDocs,
  postDoc,
  putDoc,
  removeDoc,
  resolveConflictByPicking,
  resolveConflictByMerging,
} from "@/services/pouchdbService";
const ITEMS_DB_NAME = "minifleet_items";
const POSITIONS_DB_NAME = "minifleet_positions";
const COUCHDB_URL = "http://localhost:5984/";

export default {
  components: {
    MapView,
    LeftNav,
    ConflictDialog,
  },
  data() {
    return {
      itemsDb: null,
      positionsDb: null,
      items: [],
      positions: [],
      registration: null,
      updateExists: false,
      conflictExists: false,
      conflictDb: null,
      winningDoc: null,
      conflictingDoc: null,
      winningVersionValues: null,
      conflictingVersionValues: null,
    };
  },
  async mounted() {
    //get stored items and positions from local and setup replication
    this.setupPouchDBs();
    await this.getInitialData();
  },
  created() {
    document.addEventListener("conflict-detected", this.handleConflict);
    //listen for available updates from the service worker
    document.addEventListener("swUpdateAvailable", this.updateAvailable);
    //event listener to reload page when service worker has changes
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        window.location.reload();
      });
    }
  },
  methods: {
    handleConflict(event) {
      const { db, winningDoc, conflictingDoc } = event.detail;
      this.winningVersionValues = excludeFields(winningDoc);
      this.conflictingVersionValues = excludeFields(conflictingDoc);
      this.conflictDb = db;
      this.winningDoc = winningDoc;
      this.conflictingDoc = conflictingDoc;
      this.conflictExists = true;
    },
    cancelConflictDialog() {
      //TODO: resolve later
      this.conflictExists = false;
    },
    handleChooseDoc(version, chosenVersion) {
      if (version === "merged") {
        resolveConflictByMerging(
          this.conflictDb,
          this.winningDoc,
          this.conflictingDoc,
          chosenVersion
        );
      } else {
        resolveConflictByPicking(
          this.conflictDb,
          this.winningDoc,
          this.conflictingDoc,
          version
        );
      }
      //TODO: resolveConflictByMerging
      this.conflictExists = false;
    },
    updateAvailable(event) {
      this.registration = event.detail;
      this.updateExists = true;
    },
    updateAndRefresh() {
      //only send a 'skip waiting' message if the SW is waiting
      if (!this.registration || !this.registration.waiting) return;
      //send message to SW to skip the waiting and activate the new SW
      this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
      this.updateExists = false;
    },
    remindUpdate() {
      //TODO: remind of update later
      this.updateExists = false;
    },
    async setupPouchDBs() {
      this.itemsDb = initializePouchDB(ITEMS_DB_NAME);
      this.positionsDb = initializePouchDB(POSITIONS_DB_NAME);
      await Promise.all([
        this.setupReplication(this.itemsDb, ITEMS_DB_NAME),
        this.setupReplication(this.positionsDb, POSITIONS_DB_NAME),
      ]);
    },
    async setupReplication(db, dbName) {
      //setup replication for local pouchdb to sync with remote couchdb
      const replication = PouchDB.sync(db, `${COUCHDB_URL}${dbName}`, {
        live: true,
        retry: true,
      });
      replication
        .on("change", async (info) => {
          console.log(db, " db changed");
          if (info.direction === "push") {
            console.log("pushing local updates");
          }
          if (info.direction === "pull") {
            console.log("pulling remote updates");
            if (db === this.itemsDb) {
              await this.getItems();
            } else if (db === this.positionsDb) {
              await this.getPositions();
            }
          }
        })
        .on("error", (err) => {
          console.log(`Replication error for ${db.name}`, err);
        });
      return replication;
    },
    async getInitialData() {
      await Promise.all([this.getItems(), this.getPositions()]);
    },
    async getItems() {
      //retrieve all documents from local items database
      this.items = await getAllDocs(this.itemsDb);
    },
    async getPositions() {
      this.positions = await getAllDocs(this.positionsDb);
    },
    async addNewItem(newItem) {
      //post new item to local items db
      const addition = await postDoc(this.itemsDb, newItem);
      this.getItems();
    },
    async editItem(updatedItem) {
      //put updated item to local items db
      const update = await putDoc(this.itemsDb, updatedItem);
      this.getItems();
    },
    async removeItem(itemToRemove) {
      //remove item - mark as deleted in local db
      const removal = await removeDoc(this.itemsDb, itemToRemove);
      if (removal.ok) {
        this.items = this.items.filter((item) => {
          return item.id !== itemToRemove.id;
        });
      }
      // Remove positions associated with the removed item
      const positionsToRemove = this.positions.filter(
        (pos) => pos.itemId === itemToRemove.id
      );
      await Promise.all(
        positionsToRemove.map(async (position) => {
          await this.removePosition(position);
        })
      );
      // Update the positions array after removing positions
      this.positions = this.positions.filter(
        (position) => position.itemId !== itemToRemove.id
      );
    },
    async addPosition(newPosition) {
      const addition = await postDoc(this.positionsDb, newPosition);
      this.getPositions();
    },
    async editPosition(updatedPosition) {
      const update = await putDoc(this.positionsDb, updatedPosition);
      this.getPositions();
    },
    async removePosition(positionToRemove) {
      const removal = await removeDoc(this.positionsDb, positionToRemove);
      if (removal.ok) {
        this.positions = this.positions.filter((position) => {
          return position.id !== positionToRemove.id;
        });
      }
    },
  },
};
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
  padding: 0;
  margin: 0;
  display: flex;
}
#list {
  flex: 7;
  width: 70%;
  height: 100%;
  background-color: #f0f0f0;
  overflow: auto;
  padding: 10px;
}
#map {
  flex: 3;
  width: 30%;
  height: 100%;
  overflow: hidden;
}
body {
  margin: 0;
}
.item-form {
  margin: 2%;
}
.position-form {
  margin: 2%;
}
.update-dialog {
  position: fixed;
  z-index: 2000;
  left: 60%;
  top: 40px;
  max-width: 576px;
  transform: translateX(-50%);
  border-radius: 15px;
  border: 2px solid rgb(24, 24, 157);
  box-shadow: 0 0 5px rgba(90, 87, 87, 0.5);
  padding: 12px;
  color: black;
  background-color: #ffffff;
  text-align: left;
}
.update-dialog button {
  margin: 5px;
  margin-left: 0px;
}
</style>
