<template>
  <form class="item-form" @submit.prevent="onSubmit">
    <h3>Create Item</h3>
    <div>
      <label for="name">Name:</label>
      <input id="name" v-model="name" />
    </div>
    <div>
      <label for="description">Description:</label>
      <input id="description" v-model="description" />
    </div>
    <div>
      <label for="type">Boat type:</label>
      <select id="type" v-model="type">
        <option value=""></option>
        <option value="wood">Wood</option>
        <option value="rubber">Rubber</option>
        <option value="steel">Steel</option>
      </select>
    </div>
    <div>
      <label for="color">Boat color:</label>
      <input id="color" v-model="color" />
    </div>
    <div>
      <label for="status">Status:</label>
      <select id="status" v-model="status">
        <option value=""></option>
        <option value="open">Open</option>
        <option value="mission">Mission</option>
        <option value="closed">Closed</option>
      </select>
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
      description: "",
      type: "",
      color: "",
      status: "",
    };
  },
  methods: {
    onSubmit() {
      if (this.name === "") {
        alert("Item is incomplete. Please fill out the name field.");
        return;
      }
      let newItem = {
        name: this.name,
        description: this.description,
        type: this.type,
        color: this.color,
        status: this.status,
        id: generateRandomId(),
      };
      console.log(newItem);
      this.$emit("created-item", newItem);
      this.name = "";
      this.description = "";
      this.type = "";
      this.color = "";
      this.status = "";
      this.closeModal();
    },
    closeModal() {
      this.$emit("close-modal");
    },
  },
};
</script>

<style>
.item-form label {
  padding: 2px;
}
</style>
