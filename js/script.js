
function main() {
var map = L.map('map-canvas').setView([55.505, 37], 9);

L.tileLayer('https://a.tiles.mapbox.com/v4/5nap.n1dnk63f/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiNW5hcCIsImEiOiJFRWdtc2dJIn0.BQoIUQaZuUvsipZlLS1OBA', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);





    // control that shows state info on hover
    var info = L.control();

    var sql = new cartodb.SQL({ user: '5nap', format: 'geojson' });

    info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };

    info.update = function (props) {
      this._div.innerHTML = '<h4>Flickr photos per district</h4>' +  (props ?
        '<b>' + 'Район: ' + props.name + '</b><br />' + props.count + ' photos'
        : 'Hover over');
    };

    info.addTo(map);


    // get color depending on population density value
    function getColor(d) {
      return d > 1000 ? '#800026' :
             d > 500  ? '#BD0026' :
             d > 200  ? '#E31A1C' :
             d > 100  ? '#FC4E2A' :
             d > 50   ? '#FD8D3C' :
             d > 20   ? '#FEB24C' :
             d > 10   ? '#FED976' :
                        '#FFEDA0';
    }

    function style(feature) {
      return {
        weight: 0.5,
        opacity: 1,
        color: 'white',
        //dashArray: '3',
        fillOpacity: 0.5,
        fillColor: getColor(feature.properties.count)
      };
    }

    function highlightFeature(e) {
      var layer = e.target;

      layer.setStyle({
        weight: 1,
        color: 'gray',
        //dashArray: '',
        fillOpacity: 0.7
      });

      if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
      }

      info.update(layer.feature.properties);
    }

    var geojsondata;

    function resetHighlight(e) {
      geojsondata.resetStyle(e.target);
      info.update();
    }

    function zoomToFeature(e) {
      map.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
      });
    }

    sql.execute("select cartodb_id, name, count, the_geom as the_geom from districts").done(function (geojson) {
    geojsondata = L.geoJson(geojson, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);
    });


    map.attributionControl.addAttribution('&copy; <a href="http://flickr.com/">Flickr</a>');


    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 100, 200, 500, 1000, 2000, 5000, 10000],
        labels = [],
        from, to;

      for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
          '<i style="background:' + getColor(from + 1) + '"></i> ' +
          from + (to ? '&ndash;' + to : '+'));
      }

      div.innerHTML = labels.join('<br>');
      return div;
    };

    legend.addTo(map);
}
window.onload=main;
