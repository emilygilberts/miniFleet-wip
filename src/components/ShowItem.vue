<template>
  <form class="item-form" @submit.prevent="onSubmit">
    <h3>Update {{ item.name }}</h3>
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
        <option value="none"></option>
        <option value="category1">Wood</option>
        <option value="category2">Rubber</option>
        <option value="category2">Steel</option>
      </select>
    </div>
    <div>
      <label for="color">Boat color:</label>
      <input id="color" v-model="color" />
    </div>
    <div>
      <label for="status">Status:</label>
      <select id="status" v-model="status">
        <option value="none"></option>
        <option value="category1">Open</option>
        <option value="category2">Mission</option>
        <option value="category2">Closed</option>
      </select>
    </div>
    <input
      class="button"
      type="submit"
      value="Update Item"
      :disabled="name === ''"
    />
    <button class="button" @click="closeModal">Cancel</button>
  </form>
</template>

<script>
import { ref } from "vue";
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      name: ref(this.item.name),
      description: ref(this.item.description),
      type: ref(this.item.type),
      color: ref(this.item.color),
      status: ref(this.item.status),
    };
  },
  methods: {
    onSubmit() {
      if (this.name === "") {
        alert("Item is incomplete. Please fill out every field.");
        return;
      }
      this.item.name = this.name;
      this.item.description = this.description;
      this.item.type = this.type;
      this.item.color = this.color;
      this.item.status = this.status;
      this.$emit("updatedItem", this.item);
      this.closeModal();
    },
    closeModal() {
      this.$emit("close-modal");
    },
  },
};
</script>

<style></style>
