<template>
  <form class="position-form" @submit.prevent="updatePosition">
    <h3>Update Position</h3>
    <div>
      <label for="lat">Lat:</label>
      <input id="lat" v-model="lat" />
    </div>
    <div>
      <label for="long">Long:</label>
      <input id="long" v-model="long" />
    </div>
    <div>
      <p>ItemID: {{ position.itemId }}</p>
    </div>
    <button type="submit" :disabled="itemId === ''">
      Update to a new random Position
    </button>
    <button class="button" @click="closeModal">Cancel</button>
  </form>
</template>

<script>
import { ref } from "vue";
import { getRandomLongInRange, getRandomLatInRange } from "@/utils.js";

export default {
  props: {
    position: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      lat: ref(this.position.lat),
      long: ref(this.position.long),
      itemId: ref(this.position.itemId),
    };
  },
  methods: {
    updatePosition() {
      this.position.lat = getRandomLatInRange();
      this.position.long = getRandomLongInRange();
      this.position.timestamp = new Date();
      this.$emit("updated-position", this.position);
      // Clear the form fields
      this.lat = "";
      this.long = "";
      this.itemId = "";
      this.closeModal();
    },
    closeModal() {
      this.$emit("close-modal");
    },
  },
};
</script>
<style></style>
