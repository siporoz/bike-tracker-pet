<template>
  <q-page class="row items-center justify-evenly">
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
