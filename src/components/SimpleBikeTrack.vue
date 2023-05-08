<template>
  <div class="simple-bike-track">
    <div id="distance">Дистанция</div>
    <div id="speed">Скорость</div>
    <div id="marker"></div>
    <div id="map" class="basemap"></div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { Plugins } from "@capacitor/core";
import mapboxgl from "mapbox-gl";

const { Geolocation } = Plugins;

export default defineComponent({
  name: "SimpleBikeTrack",
  data() {
    return {
      accessToken:
        "pk.eyJ1IjoibTQxaGlnaHdheSIsImEiOiJja295ZjQya2wwaTkxMnFtY203Z21wNjhzIn0.uF1S6TqlDfW7wmQ17Kp4NQ",
      routeLine: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [],
            },
            properties: {},
          },
        ],
      },
      map: null,
    };
  },
  methods: {
    totalDistance(points) {
      let total = 0;

      // eslint-disable-next-line no-plusplus
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];

        total += this.distance(prev[0], prev[1], curr[0], curr[1]);
      }

      return total;
    },
    distance(lat1, lon1, lat2, lon2) {
      const R = 6371; // Радиус Земли в километрах
      const dLat = this.toRad(lat2 - lat1);
      const dLon = this.toRad(lon2 - lon1);

      // eslint-disable-next-line max-len, no-multi-spaces, operator-linebreak
      const a =
        // eslint-disable-next-line operator-linebreak
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        // eslint-disable-next-line operator-linebreak
        Math.cos(this.toRad(lat1)) *
          // eslint-disable-next-line operator-linebreak
          Math.cos(this.toRad(lat2)) *
          // eslint-disable-next-line operator-linebreak
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    },

    toRad(degrees) {
      return degrees * (Math.PI / 180);
    },

    async getCurrentPosition() {
      console.log("ВЫЗОООВВ!!!");
      const coordinates = await Geolocation.getCurrentPosition();
      console.log("Current", coordinates);

      // Создайте маркер на карте
      const marker = new mapboxgl.Marker()
        .setLngLat([coordinates.coords.longitude, coordinates.coords.latitude])
        .addTo(this.map);

      // Переместите центр карты на текущую геопозицию пользователя
      this.map.setCenter([
        coordinates.coords.longitude,
        coordinates.coords.latitude,
      ]);
      Geolocation.watchPosition().then((newPosition) => {
        console.log("Current", newPosition);
        // position.value = newPosition;
      });
    },
  },
  async mounted() {
    mapboxgl.accessToken = this.accessToken;

    // eslint-disable-next-line no-new
    const map = new mapboxgl.Map({
      container: "map", // container ID
      // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      style: "mapbox://styles/mapbox/streets-v12", // style URL
      center: [-24, 42], // starting center in [lng, lat]
      zoom: 1, // starting zoom
    });

    const routeCoordinates = [];

    map.on("load", () => {
      map.addLayer({
        id: "route",
        type: "line",
        source: {
          type: "geojson",
          data: this.routeLine,
        },
        paint: {
          "line-color": "#007cbf",
          "line-width": 5,
          "line-opacity": 0.75,
        },
      });
    });

    let currentPosion = null;

    setTimeout(async () => {
      const coordinates = await Geolocation.getCurrentPosition();

      // Создайте маркер Старта на карте
      new mapboxgl.Marker({ color: "#252a80" })
        .setLngLat([coordinates.coords.longitude, coordinates.coords.latitude])
        .addTo(map);

      const el = document.getElementById("marker");
      el.className = "marker";

      currentPosion = new mapboxgl.Marker(el)
        .setLngLat([coordinates.coords.longitude, coordinates.coords.latitude])
        .addTo(map);

      // Переместите центр карты на текущую геопозицию пользователя
      map.setCenter([
        coordinates.coords.longitude,
        coordinates.coords.latitude,
      ]);

      Geolocation.watchPosition({}, (newPosition, err) => {
        const lon = newPosition.coords.longitude;
        const lat = newPosition.coords.latitude;

        currentPosion.setLngLat([
          newPosition.coords.longitude,
          newPosition.coords.latitude,
        ]);

        const lngLat = [lon, lat];

        map.easeTo({
          center: lngLat,
          duration: 1000, // по умолчанию
          easing(t) {
            return t; // линейная функция плавности
          },
        });

        routeCoordinates.push(lngLat);
        this.routeLine.features[0].geometry.coordinates = routeCoordinates;
        map.getSource("route").setData(this.routeLine);

        const result = this.totalDistance(routeCoordinates);
        document.getElementById("distance").innerHTML = `${result.toFixed(
          // eslint-disable-next-line comma-dangle
          2
        )} км`;

        const { speed } = newPosition.coords;
        // eslint-disable-next-line max-len
        const speedKmh = (speed * 3.6).toFixed(2); // переводим м/с в км/ч и округляем до двух знаков после запятой
        document.getElementById("speed").innerHTML = `${speedKmh} км/ч`;
        // position.value = newPosition;
      });
    }, 1000);
  },
});
</script>

<style lang="scss" scoped>
.marker {
  background-color: #007aff;
  border: 4px solid white;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
}
.basemap {
  width: 100vw;
  height: 100vh;
}
</style>
