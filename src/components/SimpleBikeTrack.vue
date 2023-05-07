<template>
  <div>
    <div>fkwelmf</div>
    <div id="map" class="basemap"></div>
  </div>
</template>

<script>
// eslint-disable
import mapboxgl from "mapbox-gl";

export default {
  name: "BaseMap",
  data() {
    return {
      accessToken:
        "pk.eyJ1IjoibTQxaGlnaHdheSIsImEiOiJja295ZjQya2wwaTkxMnFtY203Z21wNjhzIn0.uF1S6TqlDfW7wmQ17Kp4NQ",
    };
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

    // создаем линию на карте для отображения маршрута
    const routeLine = {
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
    };

    map.on("load", () => {
      map.addLayer({
        id: "route",
        type: "line",
        source: {
          type: "geojson",
          data: routeLine,
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

      function toRad(degrees) {
        return degrees * (Math.PI / 180);
      }

      function distance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Радиус Земли в километрах
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        // eslint-disable-next-line max-len, no-multi-spaces, operator-linebreak
        const a =
          // eslint-disable-next-line operator-linebreak
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          // eslint-disable-next-line operator-linebreak
          Math.cos(toRad(lat1)) *
            // eslint-disable-next-line operator-linebreak
            Math.cos(toRad(lat2)) *
            // eslint-disable-next-line operator-linebreak
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
      }

      function totalDistance(points) {
        let total = 0;

        // eslint-disable-next-line no-plusplus
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];

          total += distance(prev[0], prev[1], curr[0], curr[1]);
        }

        return total;
      }

      routeCoordinates.push(lngLat);
      routeLine.features[0].geometry.coordinates = routeCoordinates;
      map.getSource("route").setData(routeLine);

      const result = totalDistance(routeCoordinates);
      document.getElementById("distance").innerHTML = `${result.toFixed(2)} км`;

      const { speed } = e.coords;
      // eslint-disable-next-line max-len
      const speedKmh = (speed * 3.6).toFixed(2); // переводим м/с в км/ч и округляем до двух знаков после запятой
      document.getElementById("speed").innerHTML = `${speedKmh} км/ч`;
    });
  },
};
</script>

<style lang="scss" scoped>
.basemap {
  width: 1000px;
  height: 1000px;
}
</style>
