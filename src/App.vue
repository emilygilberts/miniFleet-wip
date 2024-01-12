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
      items: [],
      positions: [],
    };
  },
  methods: {
    addNewItem(newItem) {
      this.items.push(newItem);
    },
    editItem(updatedItem) {
      const index = this.items.indexOf(updatedItem);
      this.items[index] = updatedItem;
    },
    removeItem(item) {
      const index = this.items.indexOf(item);
      if (index > -1) {
        this.items.splice(index, 1);
        ////remove positions with itemid
        this.positions = this.positions.filter((pos) => pos.itemId !== item.id);
      }
    },
    addPosition(newPosition) {
      this.positions.push(newPosition);
    },
    editPosition(updatedPosition) {
      const index = this.positions.indexOf(updatedPosition);
      this.positions[index] = updatedPosition;
    },
    removePosition(position) {
      const index = this.positions.indexOf(position);
      if (index > -1) {
        this.positions.splice(index, 1);
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
