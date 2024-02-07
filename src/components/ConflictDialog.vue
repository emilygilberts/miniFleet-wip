<template>
  <div class="conflict-dialog">
    <button class="cancel-button" @click="cancelChanges">
      <i class="glyphicon glyphicon-remove"></i>
    </button>
    <div class="conflict-info">
      <h5>Resolve Conflicting Documents</h5>
      There was a conflict because two users have updated this document at the
      same time. The Database chose one winning version and one conflicting
      version. You can pick one of the versions or merge them by editing the
      fields in the middle.
    </div>
    <div class="conflict-details">
      <table>
        <thead>
          <tr>
            <th>winning</th>
            <th>Save new</th>
            <th>conflicting</th>
          </tr>
        </thead>
        <tbody>
          <!-- Iterate over each property -->
          <tr
            v-for="(property, index) in properties"
            :key="index"
            :class="{ 'different-property': isDifferentProperty(property) }"
          >
            <!-- winning Column -->
            <td>
              <div v-if="isDifferentProperty(property)">
                {{ winningVersionValues[property] }}
                <button @click="chooseProperty(property, 'winning')">
                  <i class="glyphicon glyphicon-arrow-right"></i>
                </button>
              </div>
            </td>
            <!-- Editable Column -->
            <td>
              <p>{{ property }}</p>
              <input v-model="editableContent[property]" />
            </td>

            <!-- conflicting Column -->
            <td>
              <div v-if="isDifferentProperty(property)">
                <button @click="chooseProperty(property, 'conflicting')">
                  <i class="glyphicon glyphicon-arrow-left"></i>
                </button>
                {{ conflictingVersionValues[property] }}
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>
              <button class="version-button" @click="pickVersion('winning')">
                Pick winning
              </button>
            </td>
            <td>
              <button class="version-button" @click="pickVersion('merged')">
                Save
              </button>
            </td>
            <td>
              <button
                class="version-button"
                @click="pickVersion('conflicting')"
              >
                Pick conflicting
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    winningVersionValues: Object,
    conflictingVersionValues: Object,
  },
  data() {
    return {
      editableContent: {},
      properties: Object.keys(this.winningVersionValues),
    };
  },
  created() {
    // Automatically fill editable fields with common values
    this.properties.forEach((property) => {
      // if (this.winningVersionValues[property] === this.conflictingVersionValues[property]) {
      // If the values are the same, set the editableContent to that value
      this.editableContent[property] = this.winningVersionValues[property];
      // }
    });
  },
  methods: {
    isDifferentProperty(property) {
      // Check if the property is different between winning and conflicting
      return (
        this.winningVersionValues[property] !==
        this.conflictingVersionValues[property]
      );
    },
    chooseProperty(property, source) {
      let chosenValue;

      switch (source) {
        case "winning":
          chosenValue = this.winningVersionValues[property];
          break;
        case "conflicting":
          chosenValue = this.conflictingVersionValues[property];
          break;
        default:
          break;
      }
      this.editableContent[property] = chosenValue;
    },
    pickVersion(version) {
      let chosenVersion;
      switch (version) {
        case "winning":
          chosenVersion = this.winningVersionValues;
          break;
        case "merged":
          chosenVersion = this.editableContent;
          break;
        case "conflicting":
          chosenVersion = this.conflictingVersionValues;
          break;
      }
      this.$emit("choose-doc", version, chosenVersion);
    },
    cancelChanges() {
      this.$emit("cancel-conflict-dialog");
    },
  },
};
</script>

<style>
.cancel-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  color: #ccc;
}

.cancel-button:hover {
  color: #333;
}
.conflict-info {
  margin: 1%;
}
.version-button {
  display: block;
  margin: 0 10;
}
.different-property {
  background-color: #ffcccc;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
  box-sizing: border-box;
}

th {
  background-color: #f2f2f2;
}
.conflict-dialog {
  position: fixed;
  z-index: 1000;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
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
  margin-top: 20px;
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

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}
</style>
