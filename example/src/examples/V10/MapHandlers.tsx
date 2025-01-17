import React, { useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import {
  MapView,
  Camera,
  CircleLayer,
  ShapeSource,
  Logger,
  MapState,
} from '@rnmapbox/maps';
import { Text, Divider } from '@rneui/base';
import {
  GeoJsonProperties,
  Geometry,
  GeometryCollection,
  MultiPoint,
  Point,
  Position,
} from 'geojson';
import { Feature } from 'geojson';

import Page from '../common/Page';
import colors from '../../styles/colors';
import { BaseExampleProps } from '../common/BaseExamplePropTypes';

Logger.setLogLevel('verbose');

const styles = {
  map: {
    flex: 1,
  },
  info: {
    flex: 0,
    padding: 10,
  },
  divider: {
    marginVertical: 6,
  },
  fadedText: {
    color: 'gray',
  },
};

const MapHandlers = (props: BaseExampleProps) => {
  const [lastCallback, setLastCallback] = useState('');
  const [mapState, setMapState] = useState<MapState>({
    properties: {
      center: [0, 0],
      bounds: {
        ne: [0, 0],
        sw: [0, 0],
      },
      zoom: 0,
      heading: 0,
      pitch: 0,
    },
    gestures: {
      isGestureActive: false,
      isAnimatingFromGesture: false,
    },
  });
  const [features, setFeatures] = useState<Feature<Geometry>[]>([]);

  const properties = mapState?.properties;
  const center = properties?.center;
  const bounds = properties?.bounds;
  const heading = properties?.heading;
  const gestures = mapState?.gestures;

  const buildShape = (feature: Feature<Geometry>) => {
    return {
      type: 'Point',
      // @ts-expect-error TODO
      coordinates: feature.geometry.coordinates,
    };
  };

  const addFeature = (feature: Feature<Geometry>, kind: string) => {
    const _feature: Feature<Geometry> = { ...feature };
    if (_feature.properties) {
      _feature.properties.kind = kind;
    }
    setFeatures((prev) => [...prev, _feature]);
  };

  const displayCoord = (position: Position) => {
    if (!position) {
      return '';
    }
    return `${position[1].toFixed(3)}, ${position[0].toFixed(3)}`;
  };

  return (
    <Page {...props}>
      <MapView
        style={styles.map}
        onPress={(_feature: Feature<Geometry, GeoJsonProperties>) => {
          addFeature(_feature, 'press');
        }}
        onLongPress={(_feature: Feature<Geometry, GeoJsonProperties>) => {
          addFeature(_feature, 'longPress');
        }}
        onCameraChanged={(_state) => {
          setLastCallback('onCameraChanged');
          setMapState(_state);
        }}
        onMapIdle={(_state) => {
          setLastCallback('onMapIdle');
          setMapState(_state);
        }}
      >
        <Camera
          centerCoordinate={[-73.984638, 40.759211]}
          zoomLevel={12}
          animationDuration={0}
        />
        {features.map((f, i) => {
          // @ts-expect-error TODO
          const id = JSON.stringify(f.geometry.coordinates);
          const circleStyle =
            f.properties?.kind === 'press'
              ? {
                  circleColor: colors.primary.blue,
                  circleRadius: 6,
                }
              : {
                  circleColor: colors.primary.pink,
                  circleRadius: 12,
                };
          return (
            // @ts-expect-error TODO
            <ShapeSource key={id} id={`source-${id}`} shape={buildShape(f)}>
              <CircleLayer id={`layer-${id}`} style={circleStyle} />
            </ShapeSource>
          );
        })}
      </MapView>

      <SafeAreaView>
        <View style={styles.info}>
          <Text style={styles.fadedText}>
            Tap or long-press to create a marker.
          </Text>

          <Divider style={styles.divider} />

          <Text style={styles.fadedText}>center</Text>
          <Text>{displayCoord(center)}</Text>

          <Divider style={styles.divider} />

          <Text style={styles.fadedText}>bounds</Text>
          <Text>NE: {displayCoord(bounds?.ne)}</Text>
          <Text>SW: {displayCoord(bounds?.sw)}</Text>

          <Divider style={styles.divider} />

          <Text style={styles.fadedText}>heading</Text>
          <Text>{heading?.toFixed(2)}</Text>

          <Divider style={styles.divider} />

          <Text style={styles.fadedText}>lastCallback</Text>
          <Text>{lastCallback}</Text>

          <Divider style={styles.divider} />

          <View
            style={{
              flex: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <View>
              <Text style={styles.fadedText}>isGestureActive</Text>
              <Text>{gestures?.isGestureActive ? 'Yes' : 'No'}</Text>
            </View>

            <View>
              <Text style={styles.fadedText}>isAnimatingFromGesture</Text>
              <Text>{gestures?.isAnimatingFromGesture ? 'Yes' : 'No'}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Page>
  );
};

export default MapHandlers;
