function createSelector(layer) {
        var sql = new cartodb.SQL({ user: '5nap' });
        var $options = $('#layer_selector li');
        $options.click(function(e) {
          // get the area of the selected layer
          var $li = $(e.target);
          var count = $li.attr('count');
          // deselect all and select the clicked one
          $options.removeClass('selected');
          $li.addClass('selected');
          // create query based on data from the layer
          var query = "select * from districts";
          if(count !== 'all') {
            query = "select * from districts where count > " + count;
          }
          // change the query in the layer to update the map
          layer.setSQL(query);
        });
      }

function main() {

  var options = {
                center: [55.6, 37.5], 
                zoom: 9,
                infowindow: false,
                layer_selector: false,
                legends: false,
                search: false,
                zoomControl: false
  };
  

  var vizjson = 'https://5nap.cartodb.com/api/v2/viz/4375568a-35c2-11e5-9a3a-0e9d821ea90d/viz.json';

  cartodb.createVis('map',vizjson,options)
  .done(function(vis, layers) {
       // there are two layers, base layer and points layer
       var sublayer = layers[1].getSubLayer(0);
       createSelector(sublayer);
       sublayer.set({ 'interactivity': ['cartodb_id', 'name', 'count'] });
 
       // Set the custom infowindow template defined on the html
//       sublayer.infowindow.set('template', $('#infowindow_template').html());
 
       // add the tooltip show when hover on the point
/*       vis.addOverlay({
         type: 'tooltip',
         position: 'top|center',
         template: '<p>{{name}}</p>'
       }); */
 
       vis.addOverlay({
         type: 'infobox',
         template: '<h3>{{name}}</h3><p>{{count}}</p>',
         width: 200,
         position: 'bottom|right'
       });

 
     });

}
window.onload = main















/*    var currentHover, newFeature = null;
    cartodb.createLayer(map, layerUrl)
      .addTo(map)
      .on('done', function(layer) {
        layer.getSubLayer(0).setInteraction(true);
        layer.on('featureOver', function(ev, pos, latlng, data){
          console.log("featureover");
          //check to see if it's the same feature so we don't waste an API call
          if(data.cartodb_id != currentHover) {
            layerGroup.clearLayers();
          
            $.getJSON(baseAPI + data.cartodb_id, function(res) {
          
              newFeature = L.geoJson(res,{
                style: {
                  "color": "#DCFF2E",
                  "weight": 5,
                  "opacity": 1
                }
              });
              layerGroup.addLayer(newFeature);
              layerGroup.addTo(map);
              updateSidebar(res.features[0].properties);
              updateChart(res.features[0].properties)

            })
            currentHover = data.cartodb_id;
          }
        })
        .on('featureOut', function(){
          layerGroup.clearLayers();
        })    
      }*/
         
