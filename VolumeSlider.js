import React, { PureComponent } from 'react';
import { string, func, number } from 'prop-types';
import { View, PanResponder, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    height: 28,
    marginLeft: 20,
    marginRight: 20,
    width: 150
  },
  track: {
    backgroundColor: '#333',
    height: 1,
    marginLeft: 7
  },
  fill: {
    backgroundColor: '#FFF',
    height: 1
  },
  handle: {
    position: 'absolute',
    marginLeft: -17,
    height: 28,
    width: 28
  },
  circle: {
    borderRadius: 12,
    position: 'relative',
    top: 8,
    left: 8,
    height: 12,
    width: 12
  }
});

class VolumeSlider extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      volumeTrackWidth: 0,
      volumeFillWidth: 0,
      volumePosition: 0,
      volumeOffset: 0,
      volume: props.volume
    };
    this.volumePanResponder = PanResponder;
    this.initPanResponder();
  }

  /**
   * Upon mounting, calculate the position of the volume
   * bar based on the volume property supplied to it.
   */
  componentDidMount() {
    const position = this.calculateVolumePositionFromVolume();
    this.setVolumePosition(position, true);
  }

  /**
   * Set the position of the volume slider
   *
   * @param {float} position position of the volume handle in px
   */
  setVolumePosition(position = 0, changeOffset = false) {
    const positionTmp = this.constrainToVolumeMinMax(position);
    let volumeTrackWidth = this.props.volumeWidth - positionTmp;

    if (volumeTrackWidth > 150) {
      volumeTrackWidth = 150;
    }
    this.setState(state => ({
      ...state,
      volumePosition: positionTmp + this.props.iconOffset,
      volumeFillWidth: positionTmp < 0 ? 0 : positionTmp,
      volumeTrackWidth,
      volumeOffset: changeOffset ? position : state.volumeOffset
    }));
  }

  /**
   * Constrain the volume bar to the min/max of
   * its track's width.
   *
   * @param {float} val position of the volume handle in px
   * @return {float} contrained position of the volume handle in px
   */
  constrainToVolumeMinMax(val = 0) {
    if (val <= 0) {
      return 0;
    } else if (val >= this.props.volumeWidth + 9) {
      return this.props.volumeWidth + 9;
    }
    return val;
  }

  /**
   * Get the volume based on the position of the
   * volume object.
   *
   * @return {float} volume level based on volume handle position
   */
  calculateVolumeFromVolumePosition() {
    return this.state.volumePosition / this.props.volumeWidth;
  }

  /**
   * Get the position of the volume handle based
   * on the volume
   *
   * @return {float} volume handle position in px based on volume
   */
  calculateVolumePositionFromVolume() {
    return this.props.volumeWidth / this.state.volume;
  }

  initPanResponder() {
    this.volumePanResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},

      /**
       * Update the volume as we change the position.
       * If we go to 0 then turn on the mute prop
       * to avoid that weird static-y sound.
       */
      onPanResponderMove: (evt, gestureState) => {
        const { volumeOffset } = this.state;
        const position = volumeOffset + gestureState.dx;

        this.setVolumePosition(position);
        const volume = this.calculateVolumeFromVolumePosition();

        this.props.setVolume(volume);
      },

      /**
       * Update the offset...
       */
      onPanResponderRelease: () => {
        this.setState(state => ({
          ...state,
          volumeOffset: state.volumePosition
        }));
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={[styles.fill, { width: this.state.volumeFillWidth }]} />
        <View style={[styles.track, { width: this.state.volumeTrackWidth }]} />
        <View
          style={[styles.handle, { left: this.state.volumePosition }]}
          {...this.volumePanResponder.panHandlers}
        >
          <View
            style={[styles.circle, { backgroundColor: this.props.seekColor }]}
          />
        </View>
      </View>
    );
  }
}

VolumeSlider.propTypes = {
  seekColor: string.isRequired,
  setVolume: func.isRequired,
  volumeWidth: number.isRequired,
  iconOffset: number.isRequired,
  volume: number.isRequired
};

export default VolumeSlider;
