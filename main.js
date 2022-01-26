import './style.css';
//import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import markerList from '/markerList.js';

//fullscreen control
import {FullScreen, defaults as defaultControls, ZoomSlider, MousePosition, ScaleLine, OverviewMap} from 'ol/control';

//points
import Feature from 'ol/Feature';
import Overlay from 'ol/Overlay';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import {Icon, Style} from 'ol/style';
import {Vector as VectorLayer} from 'ol/layer';
import { fromLonLat } from 'ol/proj';
import {createStringXY} from 'ol/coordinate';

const unitsSelect = document.getElementById('units');

let scaleType = 'scaleline';
let scaleBarSteps = 4;
let scaleBarText = true;
let control;

const overviewMapControl = new OverviewMap({
  // see in overviewmap-custom.html to see the custom CSS used
  className: 'ol-overviewmap ol-custom-overviewmap',
  layers: [
    new TileLayer({
      source: new OSM({
      }),
    }),
  ],
  collapseLabel: '\u00BB',
  label: '\u00AB',
  collapsed: true,
});

function scaleControl() {
  if (scaleType === 'scaleline') {
    control = new ScaleLine({
      units: unitsSelect.value,
    });
    return control;
  }
  control = new ScaleLine({
    units: unitsSelect.value,
    bar: true,
    steps: scaleBarSteps,
    text: scaleBarText,
    minWidth: 140,
  });
  return control;
}

const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(4),
  projection: 'EPSG:4326',
  // comment the following two lines to have the mouse position
  // be placed within the map.
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
});

const bistroStyle = new Style({
  image: new Icon({
    anchor: [15, 40],
    anchorXUnits: 'pixels',
    anchorYUnits: 'pixels',
    src: 'data/iconBistro.png',
  }),
});
const locoStyle = new Style({
  image: new Icon({
    anchor: [15, 40],
    anchorXUnits: 'pixels',
    anchorYUnits: 'pixels',
    src: 'data/iconLoco.png',
  }),
});
const eduStyle = new Style({
  image: new Icon({
    anchor: [15, 40],
    anchorXUnits: 'pixels',
    anchorYUnits: 'pixels',
    src: 'data/iconEdu.png',
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

for(let i = 0; i < featuresList.length; i++){
  if(featuresList[i].get('type') === 'gastro'){
    featuresList[i].setStyle(bistroStyle);
  } else if(featuresList[i].get('type') === 'loco'){
    featuresList[i].setStyle(locoStyle);
  } else if(featuresList[i].get('type') === 'edu'){
  featuresList[i].setStyle(eduStyle);
}
}
const vectorSource = new VectorSource({
  features: featuresList
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
});

const map = new Map({
  controls: defaultControls().extend([new FullScreen()]).extend([mousePositionControl]).extend([scaleControl()]).extend([overviewMapControl]),
  layers: [ new TileLayer({
    source: new OSM()
  }), vectorLayer
  ],
  target: document.getElementById('map'),
  view: new View({
    center: fromLonLat([18.6124, 54.3717]),
    zoom: 18,
    minZoom: 15,
    maxZoom: 20,
  })

});

const zoomslider = new ZoomSlider();
map.addControl(zoomslider);

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

  if (feature) {
    popup.setPosition(evt.coordinate);
    content.innerHTML = '<p>Nazwa : ' + feature.get('name') + '</p>' 
      + '<p>Opis : ' + feature.get('description') + '</p>'

  }
});

map.on('pointermove', function (e) {
  const pixel = map.getEventPixel(e.originalEvent);
  const hit = map.hasFeatureAtPixel(pixel);
  map.getTarget().style.cursor = hit ? 'pointer' : '';
});

map.on('movestart', function () {
  $(element).popover('dispose');
});

function onChange() {
  control.setUnits(unitsSelect.value);
}
function onChangeType() {
  scaleType = typeSelect.value;
  if (typeSelect.value === 'scalebar') {
    stepsSelect.style.display = 'inline';
    showScaleTextDiv.style.display = 'inline';
    map.removeControl(control);
    map.addControl(scaleControl());
  } else {
    stepsSelect.style.display = 'none';
    showScaleTextDiv.style.display = 'none';
    map.removeControl(control);
    map.addControl(scaleControl());
  }
}




