<template>
  <div>
    <button class="create-item-button" @click="toggleCreateItemModal">
      <i class="glyphicon glyphicon-plus"></i>
      New Item
    </button>

    <button class="create-item-button" @click="toggleCreatePositionModal">
      <i class="glyphicon glyphicon-plus"></i>
      New Position
    </button>
    <div class="modal" v-if="showEdit">
      <div class="modal-content">
        <ShowItem
          :item="editItem"
          @updated-name="updateName"
          @close-modal="closeShowItemModal"
        ></ShowItem>
      </div>
    </div>

    <div class="modal" v-if="showCreateItemModal">
      <div class="modal-content">
        <CreateItemForm
          @created-item="addNewItem"
          @close-modal="toggleCreateItemModal"
        ></CreateItemForm>
      </div>
    </div>
    <div class="modal" v-if="showEditPosition">
      <div class="modal-content">
        <ShowPosition
          :position="editingPosition"
          @updated-position="updatePosition"
          @close-modal="closeShowPositionModal"
        ></ShowPosition>
      </div>
    </div>
    <div class="modal" v-if="showCreatePositionModal">
      <div class="modal-content">
        <!--  v-if="!showEditPosition" -->
        <CreatePositionForm
          :items="items"
          @created-position="addPosition"
          @close-modal="toggleCreatePositionModal"
        ></CreatePositionForm>
      </div>
    </div>
    <!-- <h5>All Cases</h5> -->
    <ListItem
      v-for="item in items"
      :key="item.id"
      :item="item"
      @editItem="editThisItem(item)"
      @removeItem="removeItem"
      @editPosition="editPosition"
      @removePosition="removePosition"
      :itemPositions="getPositionsForItem(item.id)"
    ></ListItem>
  </div>
</template>

<script>
import CreateItemForm from "./CreateItemForm.vue";
import CreatePositionForm from "./CreatePositionForm.vue";
import ListItem from "./ListItem.vue";
import ShowItem from "./ShowItem.vue";
import ShowPosition from "./ShowPosition.vue";

export default {
  components: {
    CreateItemForm,
    ListItem,
    CreatePositionForm,
    ShowItem,
    ShowPosition,
  },
  data() {
    return {
      showEdit: false,
      editItem: null,
      showEditPosition: false,
      editingPosition: null,
      showCreateItemModal: false,
      showCreatePositionModal: false,
    };
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
    positions: {
      type: Array,
      required: true,
    },
  },
  methods: {
    toggleCreateItemModal() {
      this.showCreateItemModal = !this.showCreateItemModal;
    },
    toggleCreatePositionModal() {
      this.showCreatePositionModal = !this.showCreatePositionModal;
    },
    // openCreatePositionModal() {
    //   this.showCreatePositionModal = true;
    // },
    // closeCreatePositionModal() {
    //   this.showCreatePositionModal = false;
    // },
    closeShowPositionModal() {
      this.showEditPosition = false;
    },
    updateName(updatedName) {
      const index = this.items.indexOf(this.editItem);
      this.$emit("updatedName", updatedName, index);
      this.editItem = null;
      this.showEdit = false;
    },
    closeShowItemModal() {
      this.showEdit = false;
    },
    updatePosition(updatedLat, updatedLong) {
      const index = this.positions.indexOf(this.editingPosition);
      this.$emit("updatedPosition", updatedLat, updatedLong, index);
      this.showEditPosition = false;
      this.editingPosition = null;
    },
    editThisItem(item) {
      this.showEdit = true;
      this.editItem = item;
    },
    editPosition(position) {
      this.showEditPosition = true;
      this.editingPosition = position;
    },
    addNewItem(newItem) {
      this.$emit("addNewItem", newItem);
    },
    removeItem(item) {
      this.$emit("removeItem", item);
    },
    addPosition(newPosition) {
      this.$emit("addPosition", newPosition);
    },
    removePosition(position) {
      this.$emit("removePosition", position);
    },
    getPositionsForItem(itemId) {
      // Get positions associated with the item ID
      return this.positions.filter((position) => position.itemId === itemId);
    },
  },
};
</script>

<style>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px; /* Adjust the width as needed */
  text-align: center; /* Center the content horizontally */
  margin: auto; /* Center the content vertically */
}
</style>
