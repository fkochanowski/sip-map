import './style.css';
//import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import markerList from '/markerList.js';
//fullscreen control
import {FullScreen, defaults as defaultControls} from 'ol/control';

//points
import Feature from 'ol/Feature';
import Overlay from 'ol/Overlay';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import {Icon, Style} from 'ol/style';
import {Vector as VectorLayer} from 'ol/layer';
import { fromLonLat } from 'ol/proj';

//var fs = require('fs');

// let iconFeature1 = new Feature({
//   geometry: new Point(fromLonLat([ markerList.locations[0].lon, markerList.locations[0].lat ])),
//   name: markerList.locations[0].name,
//   description: markerList.locations[0].description,
//   type: markerList.locations[0].type
// });

// const iconFeature2 = new Feature({
//   geometry: new Point(fromLonLat([20, 10])),
//   name: 'Null Island2',
//   description: 'Island full of nulls222',
//   type: 'loco'
// });

// const iconFeature3 = new Feature({
//   geometry: new Point(fromLonLat([ markerList['locations'][1]['lon'], markerList['locations'][1]['lat'] ])),
//   name: 'Null Island2',
//   description: 'Island full of nulls222',
//   type: 'loco'
// });

const bistroStyle = new Style({
  image: new Icon({
    anchor: [0, 30],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'data/iconBistro.png',
  }),
});
const locoStyle = new Style({
  image: new Icon({
    anchor: [0, 30],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'data/iconLoco.png',
  }),
});
const locationsNum = Object.keys(markerList.locations).length;
let featuresList = [];
for(let i = 0; i < locationsNum; i++) {
  featuresList.push(new Feature({
    geometry: new Point(fromLonLat([ markerList.locations[i].lon, markerList.locations[i].lat ])),
    name: markerList.locations[i].name,
    description: markerList.locations[i].description,
    type: markerList.locations[i].type
  }))
}
//const featuresList = [iconFeature1, iconFeature2, iconFeature3];

for(let i = 0; i < featuresList.length; i++){
  if(featuresList[i].get('type') === 'gastro'){
    featuresList[i].setStyle(bistroStyle);
  } else if(featuresList[i].get('type') === 'loco'){
    featuresList[i].setStyle(locoStyle);
  }
}
const vectorSource = new VectorSource({
  features: featuresList
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
});

const map = new Map({
  controls: defaultControls().extend([new FullScreen()]),
  layers: [ new TileLayer({
    source: new OSM()
  }), vectorLayer
  ],
  target: document.getElementById('map'),
  view: new View({
    center: [0, 0],
    zoom: 2
  })

});

//point cd
const element = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

const popup = new Overlay({
  element: element,
  positioning: 'bottom-center',
  stopEvent: false,
});

map.addOverlay(popup);

closer.onclick = function () {
  popup.setPosition(undefined);
  closer.blur();
  return false;
};

map.on('click', function (evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });
  //const featureContents = `${feature.get('name')} ${feature.get('description')}`;
  if (feature) {
    popup.setPosition(evt.coordinate);
    content.innerHTML = '<p>Nazwa : ' + feature.get('name') + '</p>' 
      + '<p>Opis : ' + feature.get('description') + '</p>'
    /*$(element).popover({
      placement: 'top',
      html: true,
      content: featureContents
    });
    $(element).popover('show');
  } else {
    $(element).popover('dispose');*/
  }
});

// change mouse cursor when over marker
map.on('pointermove', function (e) {
  const pixel = map.getEventPixel(e.originalEvent);
  const hit = map.hasFeatureAtPixel(pixel);
  map.getTarget().style.cursor = hit ? 'pointer' : '';
});
// Close the popup when the map is moved
map.on('movestart', function () {
  $(element).popover('dispose');
});

