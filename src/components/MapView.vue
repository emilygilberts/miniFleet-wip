<template>
  <div style="height: 100vh">
    <l-map
      id="map"
      ref="map"
      style="height: 100%"
      v-model:zoom="zoom"
      :center="center"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>
      <l-circle-marker
        v-for="pos in positions"
        :lat-lng="[pos.lat, pos.long]"
        :radius="20"
        color="red"
      />
      <l-control-layers position="topright" />
      <l-control-scale position="bottomleft" />
    </l-map>
  </div>
</template>

<script>
import {
  LCircleMarker,
  LMap,
  LTileLayer,
  LControlLayers,
  LControlScale,
} from "@vue-leaflet/vue-leaflet";

export default {
  props: {
    positions: {
      type: Array,
      required: true,
    },
  },
  components: {
    LMap,
    LTileLayer,
    LCircleMarker,
    LControlLayers,
    LControlScale,
  },
  data() {
    return {
      zoom: 7,
      center: [35.8356283888737, 18.078057451092175],
    };
  },
};
</script>

<style></style>
