
function main() {
var map;
map = new L.map('map-canvas',{
  center: [55.505, 37],
  zoom: 9,
  minZoom: 9,
  maxBounds: [[55.1,36.7] , [56.1, 38.2]]
});

    // control that shows state info on hover
    var info = L.control();

    var sql = new cartodb.SQL({ user: '5nap', format: 'geojson' });

    var pointStyle = $("#pointstyle").text();

    var CdbUrl = "https://5nap.cartodb.com/api/v2/viz/f869a73a-3c2a-11e5-83dc-0e018d66dc29/viz.json";
    var CdbHMUrl = "https://5nap.cartodb.com/api/v2/viz/4ae64406-3c34-11e5-b7f2-0e4fddd5de28/viz.json";
  

    var districts;
    var lastClickedLayer;
    var cdbPoints = null;
    var cdbHM;
    var tempLayer = null;

    var style_clicked = {
        weight: 3,
        opacity: 1,
        color: 'white',
        fillOpacity: 1,
        fillColor: 'white'
      }    

    

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
        'Total ' + props.count + ' photos'
        : 'Hover over a district');
    };

    info.addTo(map);


    // get color depending on the amount of photos.
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
      return returncolor;}

    function style(feature) {
      return {
        weight: 0.3,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.count)
      };
    }

    function highlightFeature(e) {
      e.target.setStyle({
        weight: 2,
      })
/*      var layer = e.target;
      if (layer != lastClickedLayer) {layer.setStyle({
        weight: 1,
        fillOpacity: 0.7
      });}

      if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
      }
*/
      info.update(e.target.feature.properties);
    }

    
    function resetHighlight(e) {
//      if (lastClickedLayer != e.target) {districts.resetStyle(e.target);}
    e.target.setStyle({
      weight: 0.3,
    })
      info.update();
    }

    function zoomToFeature(e) {
      if (lastClickedLayer != null) {districts.resetStyle(lastClickedLayer);};
      tempLayer = e.target;
      if (lastClickedLayer != tempLayer) {
        map.fitBounds(e.target.getBounds());
      
      e.target.setStyle({
        //weight: 2,
        fillOpacity: 0.0
      });

      cartodb.createLayer(map,CdbUrl,{
      legends: false
    }).addTo(map)
        .on('done', function(layer) {
          if (cdbPoints != null) {cdbPoints.remove();};
          var subLayerOptions = {
            sql: "SELECT * FROM flickr_arch where id_distr = '"+lastClickedLayer.feature.properties.cartodb_id+"'",
            cartocss: pointStyle,
          }

          cdbPoints = layer.getSubLayer(0);
          cdbPoints.set(subLayerOptions);

          cdbPoints.infowindow.set('template', $('#infowindow_template').html());

                 
//          cdbPoints.on('featureClick', function(e, latlng, pos, data) {
//            alert("Hey! You clicked " + data.cartodb_id);
//          });
        });
      };

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

    sql.execute("select * from districts").done(function (geojson) {
    districts = L.geoJson(geojson, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map,1)});




    cdbHM = cartodb.createLayer(map,CdbHMUrl,{
      infowindow: false,
      legends: false
    }).on('done', function(layer) {
      layer.addTo(map);
    });



    //cdbLayer.bringToFront();


//    cdbSubLayer = cdbLayer.getSubLayerCount();
//    console.log('layers count: ', cdbSubLayer);
//    cdbLayer.addTo(map,5).on('done', function(layer) {
//    layer.on('featureClick', function(e, data) {
//        console.log(e, data);
//      });
//    });

    console.log('done1!');

    L.tileLayer('https://a.tiles.mapbox.com/v4/5nap.n1dnk63f/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiNW5hcCIsImEiOiJFRWdtc2dJIn0.BQoIUQaZuUvsipZlLS1OBA', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map, 0);

    
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
