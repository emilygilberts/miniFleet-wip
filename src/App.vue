<template>
  <div id="app">
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
import PouchDB from "pouchdb-browser";
import {
  initializePouchDB,
  getAllDocs,
  postDoc,
  putDoc,
  removeDoc,
} from "@/services/pouchdbService";
const ITEMS_DB_NAME = "minifleet_items";
const POSITIONS_DB_NAME = "minifleet_positions";
const COUCHDB_URL = "http://localhost:5984/";

export default {
  components: {
    MapView,
    LeftNav,
  },
  data() {
    return {
      itemsDb: null,
      positionsDb: null,
      items: [],
      positions: [],
    };
  },
  async mounted() {
    //get stored items and positions from local and setup replication
    this.setupPouchDBs();
    await this.getInitialData();
  },
  methods: {
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
          if (db === this.itemsDb) {
            console.log("items db change");
            await this.getItems();
          } else if (db === this.positionsDb) {
            console.log("positions db change");
            await this.getPositions();
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
    },
    async editItem(updatedItem) {
      //put updated item to local items db
      const update = await putDoc(this.itemsDb, updatedItem);
    },
    async removeItem(itemToRemove) {
      //remove item - mark as deleted in local db
      const removal = await removeDoc(this.itemsDb, itemToRemove);
      // Remove positions associated with the removed item
      const positionsToRemove = this.positions.filter(
        (pos) => pos.itemId === itemToRemove.id
      );
      await Promise.all(
        positionsToRemove.map(async (position) => {
          await this.removePosition(position);
        })
      );
    },
    async addPosition(newPosition) {
      const addition = await postDoc(this.positionsDb, newPosition);
    },
    async editPosition(updatedPosition) {
      const update = await putDoc(this.positionsDb, updatedPosition);
    },
    async removePosition(positionToRemove) {
      const removal = await removeDoc(this.positionsDb, positionToRemove);
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
  flex: 3;
  width: 30%;
  height: 100%;
  background-color: #f0f0f0;
  overflow: auto;
  padding: 10px;
}
#map {
  flex: 7;
  width: 70%;
  height: 100%;
  overflow: hidden;
}
body {
  margin: 0;
}
.item-form {
  /* padding: 5%; */
  margin: 2%;
}
.position-form {
  /* padding: 5%; */
  margin: 2%;
}
</style>
