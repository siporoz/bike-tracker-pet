<template>
  <div class="simple-bike-track">
    <div class="control">
      <div class="status">
        <div id="time" class="item">{{ timer }} мин.</div>
        <div id="distance" class="item">0.00 км</div>
        <div id="speed" class="item">0.00 км/ч</div>
      </div>

      <div class="actions">
        <q-btn @click="start" color="secondary" label="Старт" />
        <q-btn @click="stop" color="negative" label="Стоп" />
      </div>
    </div>
    <div id="marker" class="marker"></div>
    <div id="map" class="basemap"></div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { Plugins } from "@capacitor/core";
import mapboxgl from "mapbox-gl";
import { date } from "quasar";
// eslint-disable-next-line import/namespace
import { distance, toRad, totalDistance } from "../helpers/geolocation";

// eslint-disable-next-line object-curly-newline
const { Geolocation, BackgroundGeolocation, Modals, App } = Plugins;

export default defineComponent({
  name: "SimpleBikeTrack",
  data() {
    return {
      timer: 0,
      timerInterval: null,
      timerIsRunning: false,
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
      routeCoordinates: [],
      currentPosion: null,
    };
  },
  methods: {
    distance,
    toRad,
    totalDistance,
    async start() {
      this.startTimer();

      const coordinates = await Geolocation.getCurrentPosition();

      // Создайте маркер Старта на карте
      new mapboxgl.Marker({ color: "#252a80" })
        .setLngLat([coordinates.coords.longitude, coordinates.coords.latitude])
        .addTo(this.map);

      Geolocation.watchPosition(
        { enableHighAccuracy: true, background: true },
        (newPosition, err) => {
          this.workWithMap(newPosition);
          // eslint-disable-next-line comma-dangle
        }
      );
    },
    async stop() {
      const coordinates = await Geolocation.getCurrentPosition();

      new mapboxgl.Marker()
        .setLngLat([coordinates.coords.longitude, coordinates.coords.latitude])
        .addTo(this.map);

      this.map.setZoom(9);
      this.stopTimer();
    },
    startTimer() {
      const startTime = new Date();
      this.timerInterval = setInterval(() => {
        const nowTime = new Date();
        this.timer = date.getDateDiff(nowTime, startTime, "minutes");
      }, 1000);
    },
    stopTimer() {
      clearInterval(this.timerInterval);
    },
    workWithMap(newPosition) {
      const lon = newPosition.coords.longitude;
      const lat = newPosition.coords.latitude;

      this.currentPosion.setLngLat([
        newPosition.coords.longitude,
        newPosition.coords.latitude,
      ]);

      const lngLat = [lon, lat];

      this.map.easeTo({
        center: lngLat,
        duration: 1000, // по умолчанию
        easing(t) {
          return t; // линейная функция плавности
        },
      });

      this.routeCoordinates.push(lngLat);
      // eslint-disable-next-line operator-linebreak
      this.routeLine.features[0].geometry.coordinates = this.routeCoordinates;
      this.map.getSource("route").setData(this.routeLine);

      const result = this.totalDistance(this.routeCoordinates);
      document.getElementById("distance").innerHTML = `${result.toFixed(
        // eslint-disable-next-line comma-dangle
        2
      )} км`;

      const { speed } = newPosition.coords;
      // eslint-disable-next-line max-len
      const speedKmh = (speed * 3.6).toFixed(2); // переводим м/с в км/ч и округляем до двух знаков после запятой
      document.getElementById("speed").innerHTML = `${speedKmh} км/ч`;
      // position.value = newPosition;
      // eslint-disable-next-line comma-dangle
    },
  },
  async mounted() {
    mapboxgl.accessToken = this.accessToken;

    this.map = new mapboxgl.Map({
      container: "map", // container ID
      style: "mapbox://styles/mapbox/streets-v12", // style URL
      center: [-24, 42], // starting center in [lng, lat]
      zoom: 1, // starting zoom
    });

    this.map.on("load", () => {
      this.map.addLayer({
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

    const coordinates = await Geolocation.getCurrentPosition();

    setTimeout(() => {
      this.currentPosion = new mapboxgl.Marker(
        // eslint-disable-next-line comma-dangle
        document.getElementById("marker")
      )
        .setLngLat([coordinates.coords.longitude, coordinates.coords.latitude])
        .addTo(this.map);

      // Переместите центр карты на текущую геопозицию пользователя
      this.map.setCenter([
        coordinates.coords.longitude,
        coordinates.coords.latitude,
      ]);

      this.map.setZoom(18);

      App.addListener("appStateChange", ({ isActive }) => {
        if (isActive) {
          console.log("The app is now active");
        } else {
          console.log("The app is now inactive");
        }
      });
    }, 1000);

    try {
      BackgroundGeolocation.addWatcher(
        {
          backgroundMessage: "Cancel to prevent battery drain.",
          backgroundTitle: "Tracking You.",
          requestPermissions: true,
          stale: false,
        },
        (location, error) => {
          if (error) {
            if (error.code === "NOT_AUTHORIZED") {
              Modals.confirm({
                title: "Location Required",
                message: "Open settings now?",
              }).then(({ value }) => {
                if (value) {
                  BackgroundGeolocation.openSettings();
                }
              });
            }
            return console.error(error);
          }

          console.log("В Вотчере!!!!");
          console.log(location);
          this.workWithMap(location);

          return location;
          // eslint-disable-next-line comma-dangle
        }
      );
    } catch (e) {
      console.log(e);
    }
  },
});
</script>

<style lang="scss" scoped>
.simple-bike-track {
  position: relative;
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

  .control {
    display: grid;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    width: 90%;
    padding: 20px;
    margin: 20px;
    border-radius: 8px;
    background: white;
    position: fixed;
    z-index: 99999;
    bottom: 60px;

    .status {
      display: grid;
      grid-gap: 20px;
      grid-template-columns: 1fr 1fr 1fr;
      margin-bottom: 10px;
      .item {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 40px;
        border-radius: 4px;
        background: rgb(228, 228, 228);
      }
    }

    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: 10px;
    }
  }
}
</style>
