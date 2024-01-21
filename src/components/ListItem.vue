<template>
  <div class="list-item">
    <div class="card">
      <div class="card-content">
        <h3>{{ item.name }}</h3>
        <p>ID: {{ item.id }}</p>

        <!-- Display positions -->

        <div v-if="itemPositions.length > 0">
          <div class="toggle-container">
            <button @click="togglePositionList">
              <i
                :class="[
                  'glyphicon',
                  isPositionListExpanded
                    ? 'glyphicon-chevron-down'
                    : 'glyphicon-chevron-right',
                ]"
              ></i>
            </button>
            <p>Positions ( {{ itemPositions.length }} )</p>
          </div>
          <ul class="card-innerlist" v-if="isPositionListExpanded">
            <li v-for="position in itemPositions" :key="position.id">
              <p>{{ formatTimestamp(position.timestamp) }}</p>
              <p>lat: {{ position.lat }} , long: {{ position.long }}</p>
              <div class="button-container">
                <button @click="editPosition(position)">
                  <i class="glyphicon glyphicon-edit"></i>
                </button>
                <button @click="removePosition(position)">
                  <i class="glyphicon glyphicon-remove"></i>
                </button>
              </div>
            </li>
          </ul>
        </div>

        <button @click="editItem">
          <i class="glyphicon glyphicon-edit"></i>
        </button>

        <button @click="removeItem">
          <i class="glyphicon glyphicon-remove"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    itemPositions: {
      type: Array,
      required: false,
    },
  },
  data() {
    return {
      isPositionListExpanded: false,
    };
  },
  methods: {
    editItem() {
      this.$emit("editItem", this.item);
    },
    removeItem() {
      this.$emit("removeItem", this.item);
    },
    editPosition(position) {
      this.$emit("editPosition", position);
    },
    removePosition(position) {
      this.$emit("removePosition", position);
    },
    togglePositionList() {
      this.isPositionListExpanded = !this.isPositionListExpanded;
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}.${month}.${year} at ${hours}:${minutes} UTC`;
    },
  },
};
</script>

<style scoped>
.card {
  width: 100%;
  background-color: #fff;
  padding: 5px;
  margin: 5px;
  border: 1px solid #dddddd;
}
.card:hover {
  background-color: #f8f8f8;
}
.card h3 {
  color: #333;
  font-size: 1em;
  margin: 2px 2px 2px 2px;
}

.card p {
  color: #666;
  font-size: 0.7em;
  margin: 1px;
}
.card button {
  background-color: #e0e0e0;
  border: none;
  margin: 1px;
  cursor: pointer;
}

.toggle-container {
  display: flex;
  align-items: center;
}

.toggle-container button {
  background-color: #e0e0e0;
  padding: 5px;
  border: none;
  cursor: pointer;
  margin-right: 5px;
  font-size: 8px;
}

.card-innerlist {
  margin: 0;
  padding-left: 2%;
  list-style: none;
}

.card-innerlist li {
  border: 1px solid #ccc;
  border-radius: 5px;
  margin: 5px 0;
  padding: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-innerlist li p {
  margin: 0;
  font-size: 10px;
}

.card-innerlist li .button-container {
  display: flex;
}

.card-innerlist li button {
  background-color: #e0e0e0;
  border: none;
  padding: 2px;
  margin-left: 2px;
  cursor: pointer;
}

.card-innerlist li button:hover {
  background-color: #d0d0d0;
}
.glyphicon-edit,
.glyphicon-chevron-down,
.glyphicon-chevron-right {
  color: #3498db; /* Light blue for the edit icon */
}

.glyphicon-remove {
  color: #e74c3c; /* Light red for the delete icon */
}
</style>
