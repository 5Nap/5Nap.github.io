
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
        'ID: ' + props.cartodb_id + '<br />' +
        'Округ: ' + props.name_ao + '<br />' +
        '<b>' + 'Район: ' + props.name + '</b><br />' +
        props.count + ' photos'
        : 'Hover over a district');
    };

    info.addTo(map);


    // get color depending on population density value
    function getColor(d) {
      var red = 0;
      var green = 0;
      var blue = 0;
      var maxd = 255*Math.log(2)/Math.log(73000);
      red = maxd * Math.log(d) / Math.log(2);
      blue = 255 - maxd * Math.log(d) / Math.log(2);
      green = 255 - maxd * Math.log(d) / Math.log(2);
      intred = Math.round(red);
      intgreen = Math.round(green);
      intblue = Math.round(blue);
      var returncolor = "#";
      if (intred < 16){returncolor += "0"+intred.toString(16);
      } else {returncolor += intred.toString(16);}
      if (intgreen < 16){returncolor += "0"+intgreen.toString(16);
      } else {returncolor += intgreen.toString(16);}
      if (intblue < 16){returncolor += "0"+intblue.toString(16);
      } else {returncolor += intblue.toString(16);}
      console.log(intred, ' ', intblue, ' ', returncolor)
      return returncolor;}

    function style(feature) {
      return {
        weight: 0.2,
        opacity: 0.6,
        color: 'white',
        fillOpacity: 0.4,
        fillColor: getColor(feature.properties.count)
      };
    }

    function highlightFeature(e) {
      var layer = e.target;
      if (layer != lastClickedLayer) {layer.setStyle({
        weight: 1,
        fillOpacity: 0.7
      });}

      if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
      }

      info.update(layer.feature.properties);
    }

    var districts;
    var lastClickedLayer;
    
    function resetHighlight(e) {
      if (lastClickedLayer != e.target) {districts.resetStyle(e.target);}
      info.update();
    }

    function zoomToFeature(e) {
      if (lastClickedLayer != null) {districts.resetStyle(lastClickedLayer);};
      map.fitBounds(e.target.getBounds());
      e.target.setStyle({
        weight: 2,
        fillOpacity: 0.7
      });
      lastClickedLayer = e.target;
      info.update(lastClickedLayer.feature.properties);
    }

    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
      });
    }

//    sql.execute("select cartodb_id, name, count, the_geom as the_geom from districts").done(function (geojson) {
    sql.execute("select * from districts").done(function (geojson) {
    districts = L.geoJson(geojson, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);
    });


    map.attributionControl.addAttribution('&copy; <a href="http://flickr.com/">Flickr</a>');


    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 100, 200, 500, 1000, 2000, 5000, 10000, 75000],
        labels = [],
        from, to;

      for (var i = 0; i < grades.length-1; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
          '<i style="background:' + getColor((from+to)/2) + '"></i> ' + from + (to ? '&ndash;' + to : '+'));
      }

      div.innerHTML = labels.join('<br>');
      return div;
    };

    legend.addTo(map);
}
window.onload=main;
