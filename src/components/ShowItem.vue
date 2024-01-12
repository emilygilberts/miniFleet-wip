<template>
  <form class="item-form" @submit.prevent="onSubmit">
    <h3>Update Item</h3>
    <div>
      <label for="name">Name:</label>
      <input id="name" v-model="name" />
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
    };
  },
  methods: {
    onSubmit() {
      if (this.name === "") {
        alert("Item is incomplete. Please fill out every field.");
        return;
      }
      this.$emit("updated-name", this.name);
      this.closeModal();
    },
    closeModal() {
      this.$emit("close-modal");
    },
  },
};
</script>

<style></style>
