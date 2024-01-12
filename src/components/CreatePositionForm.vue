<template>
  <form class="position-form" @submit.prevent="createPosition">
    <h3>Create Position</h3>
    <!-- <div>
      <label for="lat">Lat:</label>
      <input id="lat" v-model="lat" />
    </div>
    <div>
      <label for="long">Long:</label>
      <input id="long" v-model="long" />
    </div> -->
    <p>Select an item to add a new random position to</p>
    <div>
      <label for="itemName">Item name:</label>
      <select name="itemName" id="itemName" v-model="itemName">
        <option v-for="item in items">{{ item.name }}</option>
      </select>
    </div>
    <button type="submit" :disabled="itemName === ''">Create Position</button>
    <button class="button" @click="closeModal">Cancel</button>
  </form>
</template>

<script>
import {
  getRandomLongInRange,
  getRandomLatInRange,
  generateRandomId,
} from "@/utils.js";
export default {
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      // lat: "",
      // long: "",
      itemName: "",
    };
  },
  methods: {
    createPosition() {
      // Create a position object with the entered data
      //get item id:
      const findItem = this.items.find((item) => {
        return item.name === this.itemName;
      });
      if (findItem) {
        const newPosition = {
          id: generateRandomId(),
          lat: getRandomLatInRange(),
          long: getRandomLongInRange(),
          timestamp: new Date(),
          itemId: findItem.id,
        };
        // Emit the created position to the parent component
        this.$emit("created-position", newPosition);
      } else {
        alert("something went wrong");
      }
      // // Clear the form fields
      // this.lat = "";
      // this.long = "";
      // this.itemName = "";
      this.closeModal();
    },
    closeModal() {
      this.$emit("close-modal");
    },
  },
};
</script>
<style></style>
