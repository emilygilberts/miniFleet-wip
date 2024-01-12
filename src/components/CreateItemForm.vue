<template>
  <form class="item-form" @submit.prevent="onSubmit">
    <h3>Create Item</h3>
    <div>
      <label for="name">Name:</label>
      <input id="name" v-model="name" />
    </div>
    <input
      class="button"
      type="submit"
      value="Create Item"
      :disabled="name === ''"
    />
    <button class="button" @click="closeModal">Cancel</button>
  </form>
</template>

<script>
import { generateRandomId } from "@/utils.js";
export default {
  data() {
    return {
      name: "",
    };
  },
  methods: {
    onSubmit() {
      if (this.name === "") {
        alert("Item is incomplete. Please fill out every field.");
        return;
      }
      let newItem = {
        name: this.name,
        id: generateRandomId(),
      };
      this.$emit("created-item", newItem);
      this.name = "";
      this.closeModal();
    },
    closeModal() {
      this.$emit("close-modal");
    },
  },
};
</script>

<style></style>
