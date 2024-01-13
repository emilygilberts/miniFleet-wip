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
    this.initializePouchDBs();
    await this.getInitialData();
  },
  methods: {
    async initializePouchDBs() {
      this.itemsDb = new PouchDB(ITEMS_DB_NAME);
      this.positionsDb = new PouchDB(POSITIONS_DB_NAME);
      await Promise.all([
        this.setupReplication(this.itemsDb, ITEMS_DB_NAME),
        this.setupReplication(this.positionsDb, POSITIONS_DB_NAME),
      ]);
    },
    async getInitialData() {
      await Promise.all([this.getItems(), this.getPositions()]);
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
            await this.getItems();
          } else if (db === this.positionsDb) {
            await this.getPositions();
          }
        })
        .on("error", (err) => {
          console.log(`Replication error for ${db.name}`, err);
        });
      return replication;
    },
    async getItems() {
      //retrieve all documents from local items database
      const allDocs = await this.itemsDb.allDocs({
        include_docs: true,
      });
      //map document contents to items and filter out design documents from couchdb
      const items = allDocs.rows
        .filter((row) => !row.id.startsWith("_design/"))
        .map((row) => row.doc);
      this.items = items;
    },

    async addNewItem(newItem) {
      //post new item to local items db
      const addition = await this.itemsDb.post(newItem);
    },
    async editItem(updatedItem) {
      //put updated item to local items db
      const update = await this.itemsDb.put(updatedItem);
    },
    async removeItem(itemToRemove) {
      //remove item - mark as deleted in local db
      const removal = await this.itemsDb.remove(itemToRemove);
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
    async getPositions() {
      const allDocs = await this.positionsDb.allDocs({
        include_docs: true,
      });
      //filter out design documents from couchdb
      const positions = allDocs.rows
        .filter((row) => !row.id.startsWith("_design/"))
        .map((row) => row.doc);
      this.positions = positions;
    },
    async addPosition(newPosition) {
      const addition = await this.positionsDb.post(newPosition);
    },
    async editPosition(updatedPosition) {
      const update = await this.positionsDb.put(updatedPosition);
    },
    async removePosition(positionToRemove) {
      //remove position - mark as deleted in local db
      const removal = await this.positionsDb.remove(positionToRemove);
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
