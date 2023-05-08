<template>
  <q-page class="index row items-center justify-evenly">
    <SimpleBikeTrack />
  </q-page>
</template>

<script lang="ts">
import SimpleBikeTrack from "components/SimpleBikeTrack.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "IndexPage",
  data() {
    return {};
  },
  components: {
    SimpleBikeTrack,
  },
});
</script>

<style lang="scss" scoped>
.index {
  width: 100vw;
  height: 100vh;

  .simple-bike-track {
    margin-top: 50px;
  }
}
</style>
