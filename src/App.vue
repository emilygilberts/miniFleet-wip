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

export default {
  components: {
    MapView,
    LeftNav,
  },
  data() {
    return {
      initialLoadItems: [],
      initialLoadPositions: [],
      items: [],
      positions: [],
    };
  },
  beforeMount() {
    //get stored items from local storage
    const storedItems = localStorage.getItem("minifleet_items")
      ? JSON.parse(localStorage.getItem("minifleet_items"))
      : this.initialLoadItems;
    this.items = storedItems;
    //get stored positions from local storage
    const storedPositions = localStorage.getItem("minifleet_positions")
      ? JSON.parse(localStorage.getItem("minifleet_positions"))
      : this.initialLoadPositions;
    this.positions = storedPositions;
  },
  methods: {
    updateItemStorage() {
      localStorage.setItem("minifleet_items", JSON.stringify(this.items));
    },
    updatePositionStorage() {
      localStorage.setItem(
        "minifleet_positions",
        JSON.stringify(this.positions)
      );
    },
    addNewItem(newItem) {
      this.items.push(newItem);
      this.updateItemStorage();
    },
    editItem(updatedItem) {
      const index = this.items.indexOf(updatedItem);
      this.items[index] = updatedItem;
      this.updateItemStorage();
    },
    removeItem(item) {
      const index = this.items.indexOf(item);
      if (index > -1) {
        this.items.splice(index, 1);
        ////remove positions with itemid
        this.positions = this.positions.filter((pos) => pos.itemId !== item.id);
      }
      this.updateItemStorage();
      this.updatePositionStorage();
    },
    addPosition(newPosition) {
      this.positions.push(newPosition);
      this.updatePositionStorage();
    },
    editPosition(updatedPosition) {
      const index = this.positions.indexOf(updatedPosition);
      this.positions[index] = updatedPosition;
      this.updatePositionStorage();
    },
    removePosition(position) {
      const index = this.positions.indexOf(position);
      if (index > -1) {
        this.positions.splice(index, 1);
      }
      this.updatePositionStorage();
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
