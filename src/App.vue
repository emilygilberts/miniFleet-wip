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
    //on mounted get stored items and positions from local pouchdb
    const itemsdb = new PouchDB("minifleet_items");
    this.itemsDb = itemsdb;
    await this.getItems();

    const positionsdb = new PouchDB("minifleet_positions");
    this.positionsDb = positionsdb;
    await this.getPositions();
  },
  methods: {
    async getItems() {
      //retrieve all documents from local items database
      const allDocs = await this.itemsDb.allDocs({
        include_docs: true,
      });
      //map document contents to items
      this.items = allDocs.rows.map((row) => row.doc);
    },
    async addNewItem(newItem) {
      //post new item to local items db
      const addition = await this.itemsDb.post(newItem);
      if (addition.ok) {
        await this.getItems();
      }
    },
    async editItem(updatedItem) {
      //put updated item to local items db
      const update = await this.itemsDb.put(updatedItem);
      if (update.ok) {
        await this.getItems();
      }
    },
    async removeItem(itemToRemove) {
      //remove item - mark as deleted in local db
      const removal = await this.itemsDb.remove(itemToRemove);
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
          const removedPosition = await this.positionsDb.remove(position);
        })
      );
      // Update the positions array after removing positions
      this.positions = this.positions.filter(
        (position) => position.itemId !== itemToRemove.id
      );
    },
    async getPositions() {
      const allDocs = await this.positionsDb.allDocs({
        include_docs: true,
      });
      this.positions = allDocs.rows.map((row) => row.doc);
    },
    async addPosition(newPosition) {
      const addition = await this.positionsDb.post(newPosition);
      if (addition.ok) {
        await this.getPositions();
      }
    },
    async editPosition(updatedPosition) {
      const update = await this.positionsDb.put(updatedPosition);
      if (update.ok) {
        await this.getPositions();
      }
    },
    async removePosition(positionToRemove) {
      //remove position - mark as deleted in local db
      const removal = await this.positionsDb.remove(positionToRemove);
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
