<template>
  <div class="simple-bike-track">
    <div id="map" class="basemap"></div>
    <div>TEST</div>
  </div>
</template>

<script>
// eslint-disable
import mapboxgl from "mapbox-gl";
import { Geolocation } from "@capacitor/geolocation";

export default {
  name: "BaseMap",
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

    getCurrentPosition() {
      // Geolocation.getCurrentPosition().then((newPosition) => {
      //   position.value = newPosition;
      // });
    },
  },
  mounted() {
    mapboxgl.accessToken = this.accessToken;

    // eslint-disable-next-line no-new
    const map = new mapboxgl.Map({
      container: "map", // container ID
      // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      style: "mapbox://styles/mapbox/streets-v12", // style URL
      center: [-24, 42], // starting center in [lng, lat]
      zoom: 1, // starting zoom
    });

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });

    // Добавление контроля на карту
    map.addControl(geolocate);

    // создаем массив для хранения координат маршрута
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

    // Обработчик события "geolocate"
    geolocate.on("geolocate", (e) => {
      const lon = e.coords.longitude;
      const lat = e.coords.latitude;

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
      document.getElementById("distance").innerHTML = `${result.toFixed(2)} км`;

      const { speed } = e.coords;
      // eslint-disable-next-line max-len
      const speedKmh = (speed * 3.6).toFixed(2); // переводим м/с в км/ч и округляем до двух знаков после запятой
      document.getElementById("speed").innerHTML = `${speedKmh} км/ч`;
    });
    this.getCurrentPosition();

    // Geolocation.watchPosition({}, (newPosition, err) => {
    //   console.log("New GPS position");
    //   console.log(newPosition);
    // });
  },
};
</script>

<style lang="scss" scoped>
.basemap {
  width: 100vw;
  height: 100%;
}
</style>
