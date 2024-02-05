<template>
  <div class="conflict-dialog">
    <p>Conflict detected!</p>
    <div class="conflict-details">
      <div class="conflict-doc">
        <h5>Original Document</h5>
        <!-- Display properties of the original document -->
        <pre>{{ conflictDoc }}</pre>
      </div>
      <div class="conflicting-versions">
        <h5>Conflicting Versions</h5>
        <!-- Display properties of conflicting versions -->
        <div>
          <pre>
              {{ conflictingVersion }}
            </pre
          >
        </div>
      </div>
    </div>
    <div class="conflict-dialog-buttons">
      <button @click="chooseDoc('mine')">Choose Mine</button>
      <button @click="chooseDoc('incoming')">Choose Incoming</button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    conflictDb: Object,
    conflictDoc: Object,
    conflictingVersion: Object,
  },
  methods: {
    chooseDoc(choice) {
      this.$emit("choose-doc", choice);
    },
  },
};
</script>
<style>
.conflict-dialog {
  position: fixed;
  z-index: 1000;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  max-width: 90%;
  max-height: 90%;
  border-radius: 15px;
  border: 2px solid rgb(24, 24, 157);
  box-shadow: 0 0 5px rgba(90, 87, 87, 0.5);
  padding: 12px;
  color: black;
  background-color: #ffffff;
  text-align: left;
  overflow: scroll;
}

.conflict-details {
  display: flex;
  flex-wrap: wrap;
}

.conflict-doc,
.conflicting-versions {
  flex: 1;
  min-width: 0;
  padding: 10px;
  border: 1px solid #ddd;
  margin: 5px;
}
.conflict-doc pre,
.conflicting-versions pre {
  font-size: 10px;
  padding: 8px;
}

.conflict-dialog-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.conflict-dialog-buttons button {
  flex: 1;
  margin: 5px;
}
</style>
