/* eslint react/sort-comp: 1 */
import React, { Component } from 'react';
import {
  string,
  bool,
  number,
  func,
  oneOfType,
  array,
  object,
  shape
} from 'prop-types';
import Video from 'react-native-video';
import {
  TouchableWithoutFeedback,
  TouchableHighlight,
  ImageBackground,
  PanResponder,
  StyleSheet,
  Animated,
  Easing,
  Image,
  View,
  Text
} from 'react-native';
import _ from 'lodash';

import topBackground from './assets/img/top-vignette.png';
import bottomBackground from './assets/img/bottom-vignette.png';
import backImage from './assets/img/back.png';
import volumeImage from './assets/img/volume.png';
import shrink from './assets/img/shrink.png';
import expand from './assets/img/expand.png';
import playImage from './assets/img/play.png';
import pauseImage from './assets/img/pause.png';
import loaderIcon from './assets/img/loader-icon.png';
import errorIcon from './assets/img/error-icon.png';
import VolumeSlider from './VolumeSlider';

export const VolumeSliderLayout = VolumeSlider;

/**
 * This object houses our styles. There's player
 * specific styles and control specific ones.
 * And then there's volume/seeker styles.
 */
const styles = {
  player: StyleSheet.create({
    container: {
      backgroundColor: '#000',
      flex: 1,
      alignSelf: 'stretch',
      justifyContent: 'space-between'
    },
    video: {
      overflow: 'hidden',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  }),
  error: StyleSheet.create({
    container: {
      backgroundColor: 'rgba( 0, 0, 0, 0.5 )',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      justifyContent: 'center',
      alignItems: 'center'
    },
    icon: {
      marginBottom: 16
    },
    text: {
      backgroundColor: 'transparent',
      color: '#f27474'
    }
  }),
  loader: StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center'
    }
  }),
  controls: StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: null,
      width: null
    },
    column: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: null,
      width: null
    },
    vignette: {
      resizeMode: 'stretch'
    },
    control: {
      padding: 16
    },
    text: {
      backgroundColor: 'transparent',
      color: '#FFF',
      fontSize: 14,
      textAlign: 'center'
    },
    pullRight: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    top: {
      flex: 1,
      alignItems: 'stretch',
      justifyContent: 'flex-start'
    },
    bottom: {
      alignItems: 'stretch',
      flex: 2,
      justifyContent: 'flex-end'
    },
    topControlGroup: {
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      width: null,
      margin: 12,
      marginBottom: 18
    },
    bottomControlGroup: {
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginLeft: 12,
      marginRight: 12,
      marginBottom: 0
    },
    volume: {
      flexDirection: 'row'
    },
    fullscreen: {
      flexDirection: 'row'
    },
    playPause: {
      position: 'relative',
      width: 80,
      zIndex: 0
    },
    title: {
      alignItems: 'center',
      flex: 0.6,
      flexDirection: 'column',
      padding: 0
    },
    titleText: {
      textAlign: 'center'
    },
    timer: {
      width: 80
    },
    timerText: {
      backgroundColor: 'transparent',
      color: '#FFF',
      fontSize: 11,
      textAlign: 'right'
    }
  }),
  seekbar: StyleSheet.create({
    container: {
      alignSelf: 'stretch',
      height: 28,
      marginLeft: 20,
      marginRight: 20
    },
    track: {
      backgroundColor: '#333',
      height: 1,
      position: 'relative',
      top: 14,
      width: '100%'
    },
    fill: {
      backgroundColor: '#FFF',
      height: 1,
      width: '100%'
    },
    handle: {
      position: 'absolute',
      marginLeft: -7,
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
  })
};

export default class VideoPlayer extends Component {
  static propTypes = {
    resizeMode: string,
    paused: bool,
    muted: bool,
    volume: number,
    rate: number,
    playWhenInactive: bool,
    playInBackground: bool,
    repeat: bool,
    title: string,
    onError: func,
    onEnd: func,
    onBack: func,
    controlTimeout: number,
    videoStyle: oneOfType([array, number, object]),
    style: oneOfType([array, number, object]),
    onLoadStart: func,
    onLoad: func,
    onProgress: func,
    navigation: shape({
      goBack: func.isRequired
    }),
    disableBack: bool,
    disableVolume: bool,
    disableFullscreen: bool,
    disablePlayPause: bool,
    disableTimer: bool,
    disableSeekbar: bool,
    topBackground: number,
    bottomBackground: number,
    backImage: number,
    volumeImage: number,
    fullscreenImages: shape({
      shrink: number.isRequired,
      expand: number.isRequired
    }),
    seekColor: string,
    playImage: number,
    pauseImage: number,
    loaderIcon: number,
    errorIcon: number,
    source: oneOfType([
      shape({
        uri: string.isRequired
      }),
      number
    ]).isRequired,
    renderError: func,
    renderLoader: func,
    renderTimer: func,
    renderTitle: func
  };

  static defaultProps = {
    resizeMode: 'contain',
    paused: false,
    muted: false,
    volume: 1,
    rate: 1,
    playWhenInactive: false,
    playInBackground: false,
    repeat: false,
    title: '',
    onError: null,
    onEnd: null,
    onBack: null,
    controlTimeout: 15000,
    videoStyle: {},
    style: {},
    onLoadStart: null,
    onLoad: null,
    onProgress: null,
    navigation: null,
    disableBack: false,
    disableVolume: false,
    disableFullscreen: false,
    disablePlayPause: false,
    disableTimer: false,
    disableSeekbar: false,
    topBackground,
    bottomBackground,
    backImage,
    volumeImage,
    fullscreenImages: {
      shrink,
      expand
    },
    seekColor: '#FFF',
    playImage,
    pauseImage,
    loaderIcon,
    errorIcon,
    renderError: null,
    renderLoader: null,
    renderTimer: null,
    renderTitle: null
  };

  constructor(props) {
    super(props);

    const {
      resizeMode,
      paused,
      muted,
      volume,
      rate,
      playWhenInactive,
      playInBackground,
      repeat,
      title,
      onError,
      onEnd,
      onBack,
      controlTimeout,
      videoStyle,
      style
    } = props;
    /**
     * All of our values that are updated by the
     * methods and listeners in this class
     */
    this.state = {
      // Video
      resizeMode,
      paused,
      muted,
      volume,
      rate,
      // Controls

      isFullscreen: resizeMode === 'cover' || false,
      showTimeRemaining: true,
      lastScreenPress: 0,
      seekerFillWidth: 0,
      showControls: true,
      seekerPosition: 0,
      seekerOffset: 0,
      seeking: false,
      loading: false,
      currentTime: 0,
      error: false,
      duration: 0,
      errorMsg: ''
    };

    /**
     * Any options that can be set at init.
     */
    this.opts = {
      playWhenInactive,
      playInBackground,
      repeat,
      title
    };

    /**
     * Our app listeners and associated methods
     */
    this.events = {
      onError: onError || this.onError.bind(this),
      onEnd: onEnd || this.onEnd.bind(this),
      onScreenTouch: this.onScreenTouch.bind(this),
      onLoadStart: this.onLoadStart.bind(this),
      onProgress: this.onProgress.bind(this),
      onLoad: this.onLoad.bind(this)
    };

    /**
     * Functions used throughout the application
     */
    this.methods = {
      onBack: onBack || this.onBack.bind(this),
      toggleFullscreen: this.toggleFullscreen.bind(this),
      togglePlayPause: this.togglePlayPause.bind(this),
      toggleControls: this.toggleControls.bind(this),
      toggleTimer: this.toggleTimer.bind(this)
    };

    /**
     * Player information
     */
    this.player = {
      controlTimeoutDelay: controlTimeout,
      seekPanResponder: PanResponder,
      controlTimeout: null,
      volumeWidth: 150,
      iconOffset: 7,
      seekWidth: 0,
      ref: Video
    };

    /**
     * Various animations
     */
    this.animations = {
      bottomControl: {
        marginBottom: new Animated.Value(0),
        opacity: new Animated.Value(1)
      },
      topControl: {
        marginTop: new Animated.Value(0),
        opacity: new Animated.Value(1)
      },
      video: {
        opacity: new Animated.Value(1)
      },
      loader: {
        rotate: new Animated.Value(0),
        MAX_VALUE: 360
      }
    };

    /**
     * Various styles that be added...
     */
    this.styles = {
      videoStyle,
      containerStyle: style
    };
  }

  /**
    | -------------------------------------------------------
    | Events
    | -------------------------------------------------------
    |
    | These are the events that the <Video> component uses
    | and can be overridden by assigning it as a prop.
    | It is suggested that you override onEnd.
    |
    */

  /**
   * When load starts we display a loading icon
   * and show the controls.
   */
  onLoadStart(...rest) {
    this.setState(
      state => ({
        ...state,
        loading: true
      }),
      () => {
        this.loadAnimation();
      }
    );
    if (this.props.onLoadStart) {
      this.props.onLoadStart(...rest);
    }
  }

  /**
   * When load is finished we hide the load icon
   * and hide the controls. We also set the
   * video duration.
   *
   * @param {object} data The video meta data
   */
  onLoad(data = {}, ...rest) {
    this.setState(state => ({
      ...state,
      duration: data.duration,
      loading: false
    }));
    if (this.state.showControls) {
      this.setControlTimeout();
    }
    if (this.props.onLoad) {
      this.props.onLoad(data, ...rest);
    }
  }

  /**
   * For onprogress we fire listeners that
   * update our seekbar and timer.
   *
   * @param {object} data The video meta data
   */
  onProgress(data = {}, ...rest) {
    this.setState(
      state => ({
        ...state,
        currentTime: data.currentTime
      }),
      () => {
        if (!this.state.seeking) {
          const position = this.calculateSeekerPosition();
          this.setSeekerPosition(position);
        }

        if (this.props.onProgress) {
          this.props.onProgress(data, ...rest);
        }
      }
    );
  }

  /**
   * It is suggested that you override this
   * command so your app knows what to do.
   * Either close the video or go to a
   * new page.
   */
  onEnd() {}

  /**
   * Set the error state to true which then
   * changes our renderError function
   *
   * @param {object} err  Err obj returned from <Video> component
   */
  onError(err) {
    this.setState(state => ({
      ...state,
      error: true,
      loading: false,
      errorMsg: JSON.stringify(err)
    }));
  }

  /**
   * This is a single and double tap listener
   * when the user taps the screen anywhere.
   * One tap toggles controls, two toggles
   * fullscreen mode.
   */
  onScreenTouch() {
    if (this.props.disableFullscreen) {
      this.methods.toggleControls();
    } else {
      const { lastScreenPress } = this.state;
      const time = new Date().getTime();
      const delta = time - lastScreenPress;

      if (delta < 300) {
        this.methods.toggleFullscreen();
      }

      this.methods.toggleControls();
      this.setState(state => ({
        ...state,
        lastScreenPress: time
      }));
    }
  }

  /**
    | -------------------------------------------------------
    | Methods
    | -------------------------------------------------------
    |
    | These are all of our functions that interact with
    | various parts of the class. Anything from
    | calculating time remaining in a video
    | to handling control operations.
    |
    */

  /**
   * Set a timeout when the controls are shown
   * that hides them after a length of time.
   * Default is 15s
   */
  setControlTimeout() {
    this.player.controlTimeout = setTimeout(() => {
      this.hideControls();
    }, this.player.controlTimeoutDelay);
  }

  /**
   * Set the position of the seekbar's components
   * (both fill and handle) according to the
   * position supplied.
   *
   * @param {float} position position in px of seeker handle}
   */
  setSeekerPosition(position = 0) {
    const positionTmp = this.constrainToSeekerMinMax(position);

    this.setState(state => ({
      ...state,
      seekerFillWidth: positionTmp,
      seekerPosition: positionTmp,
      seekerOffset: state.seeking ? state.seekerOffset : positionTmp
    }));
  }

  /**
   * Clear the hide controls timeout.
   */
  clearControlTimeout() {
    clearTimeout(this.player.controlTimeout);
  }

  /**
   * Reset the timer completely
   */
  resetControlTimeout() {
    this.clearControlTimeout();
    this.setControlTimeout();
  }

  /**
   * Animation to hide controls. We fade the
   * display to 0 then move them off the
   * screen so they're not interactable
   */
  hideControlAnimation() {
    Animated.parallel([
      Animated.timing(this.animations.topControl.opacity, { toValue: 0 }),
      Animated.timing(this.animations.topControl.marginTop, { toValue: -100 }),
      Animated.timing(this.animations.bottomControl.opacity, { toValue: 0 }),
      Animated.timing(this.animations.bottomControl.marginBottom, {
        toValue: -100
      })
    ]).start();
  }

  /**
   * Animation to show controls...opposite of
   * above...move onto the screen and then
   * fade in.
   */
  showControlAnimation() {
    Animated.parallel([
      Animated.timing(this.animations.topControl.opacity, { toValue: 1 }),
      Animated.timing(this.animations.topControl.marginTop, { toValue: 0 }),
      Animated.timing(this.animations.bottomControl.opacity, { toValue: 1 }),
      Animated.timing(this.animations.bottomControl.marginBottom, {
        toValue: 0
      })
    ]).start();
  }

  /**
   * Loop animation to spin loader icon. If not loading then stop loop.
   */
  loadAnimation() {
    if (this.state.loading) {
      Animated.sequence([
        Animated.timing(this.animations.loader.rotate, {
          toValue: this.animations.loader.MAX_VALUE,
          duration: 1500,
          easing: Easing.linear
        }),
        Animated.timing(this.animations.loader.rotate, {
          toValue: 0,
          duration: 0,
          easing: Easing.linear
        })
      ]).start(this.loadAnimation.bind(this));
    }
  }

  /**
   * Function to hide the controls. Sets our
   * state then calls the animation.
   */
  hideControls() {
    this.hideControlAnimation();

    this.setState(state => ({
      ...state,
      showControls: false
    }));
  }

  /**
   * Function to toggle controls based on
   * current state.
   */
  toggleControls() {
    const { state } = this;
    state.showControls = !state.showControls;

    if (state.showControls) {
      this.showControlAnimation();
      this.setControlTimeout();
    } else {
      this.hideControlAnimation();
      this.clearControlTimeout();
    }

    this.setState(state);
  }

  /**
   * Toggle fullscreen changes resizeMode on
   * the <Video> component then updates the
   * isFullscreen state.
   */
  toggleFullscreen() {
    this.setState(state => ({
      ...state,
      isFullscreen: !state.isFullscreen,
      resizeMode: !state.isFullscreen === true ? 'cover' : 'contain'
    }));
  }

  /**
   * Toggle playing state on <Video> component
   */
  togglePlayPause() {
    this.setState(state => ({
      ...state,
      paused: !state.paused
    }));
  }

  /**
   * Toggle between showing time remaining or
   * video duration in the timer control
   */
  toggleTimer() {
    this.setState(state => ({
      ...state,
      showTimeRemaining: !state.showTimeRemaining
    }));
  }

  /**
   * The default 'onBack' function pops the navigation
   * and as such the video player requires a
   * navigation prop by default.
   */
  onBack() {
    if (this.props.navigation) {
      this.props.navigation.goBack();
    } else {
      console.warn(
        'Warning: onBack requires navigation property to function. Either modify the onBack prop or pass a navigation prop'
      );
    }
  }

  /**
   * Calculate the time to show in the timer area
   * based on if they want to see time remaining
   * or duration. Formatted to look as 00:00.
   */
  calculateTime() {
    const { showTimeRemaining, duration, currentTime } = this.state;

    if (showTimeRemaining) {
      const time = duration - currentTime;
      return `-${this.formatTime(time)}`;
    }

    return this.formatTime(currentTime);
  }

  /**
   * Format a time string as mm:ss
   *
   * @param {int} time time in milliseconds
   * @return {string} formatted time string in mm:ss format
   */
  formatTime(time = 0) {
    const symbol = this.state.showRemainingTime ? '-' : '';
    const tmpTime = Math.min(Math.max(time, 0), this.state.duration);

    const formattedMinutes = _.padStart(
      Math.floor(tmpTime / 60).toFixed(0),
      2,
      0
    );
    const formattedSeconds = _.padStart(
      Math.floor(tmpTime % 60).toFixed(0),
      2,
      0
    );

    return `${symbol}${formattedMinutes}:${formattedSeconds}`;
  }

  /**
   * Contrain the location of the seeker to the
   * min/max value based on how big the
   * seeker is.
   *
   * @param {float} val position of seeker handle in px
   * @return {float} contrained position of seeker handle in px
   */
  constrainToSeekerMinMax(val = 0) {
    if (val <= 0) {
      return 0;
    } else if (val >= this.player.seekerWidth) {
      return this.player.seekerWidth;
    }
    return val;
  }

  /**
   * Calculate the position that the seeker should be
   * at along its track.
   *
   * @return {float} position of seeker handle in px based on currentTime
   */
  calculateSeekerPosition() {
    const percent = this.state.currentTime / this.state.duration;
    return this.player.seekerWidth * percent;
  }

  /**
   * Return the time that the video should be at
   * based on where the seeker handle is.
   *
   * @return {float} time in ms based on seekerPosition.
   */
  calculateTimeFromSeekerPosition() {
    const percent = this.state.seekerPosition / this.player.seekerWidth;
    return this.state.duration * percent;
  }

  /**
   * Seek to a time in the video.
   *
   * @param {float} time time to seek to in ms
   */
  seekTo(time = 0) {
    this.player.ref.seek(time);

    this.setState(state => ({
      ...state,
      currentTime: time
    }));
  }


  /**
    | -------------------------------------------------------
    | React Component functions
    | -------------------------------------------------------
    |
    | Here we're initializing our listeners and getting
    | the component ready using the built-in React
    | Component methods
    |
    */

  /**
   * Before mounting, init our seekbar and volume bar
   * pan responders.
   */
  componentWillMount() {
    this.initSeekPanResponder();
  }

  /**
   * To allow basic playback management from the outside
   * we have to handle possible props changes to state changes
   */
  componentWillReceiveProps(nextProps) {
    if (this.state.paused !== nextProps.paused) {
      this.setState(state => ({
        ...state,
        paused: nextProps.paused
      }));
    }
  }

  /**
   * When the component is about to unmount kill the
   * timeout less it fire in the prev/next scene
   */
  componentWillUnmount() {
    this.clearControlTimeout();
  }

  /**
   * Get our seekbar responder going
   */
  initSeekPanResponder() {
    this.player.seekPanResponder = PanResponder.create({
      // Ask to be the responder.
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      /**
       * When we start the pan tell the machine that we're
       * seeking. This stops it from updating the seekbar
       * position in the onProgress listener.
       */
      onPanResponderGrant: () => {
        this.clearControlTimeout();
        this.setState(state => ({
          ...state,
          seeking: true
        }));
      },

      /**
       * When panning, update the seekbar position, duh.
       */
      onPanResponderMove: (evt, gestureState) => {
        const position = this.state.seekerOffset + gestureState.dx;
        this.setSeekerPosition(position);
      },

      /**
       * On release we update the time and seek to it in the video.
       * If you seek to the end of the video we fire the
       * onEnd callback
       */
      onPanResponderRelease: () => {
        const time = this.calculateTimeFromSeekerPosition();
        const { duration, loading } = this.state;

        if (time >= duration && !loading) {
          this.setState(
            state => ({
              ...state,
              paused: true
            }),
            () => {
              this.events.onEnd();
            }
          );
        } else {
          this.seekTo(time);
          this.setControlTimeout();
          this.setState(state => ({
            ...state,
            seeking: false
          }));
        }
      }
    });
  }

  /**
    | -------------------------------------------------------
    | Rendering
    | -------------------------------------------------------
    |
    | This section contains all of our render methods.
    | In addition to the typical React render func
    | we also have all the render methods for
    | the controls.
    |
    */

  /**
   * Standard render control function that handles
   * everything except the sliders. Adds a
   * consistent <TouchableHighlight>
   * wrapper and styling.
   */
  renderControl(children, callback, style = {}) {
    return (
      <TouchableHighlight
        underlayColor="transparent"
        activeOpacity={0.3}
        onPress={() => {
          this.resetControlTimeout();
          callback();
        }}
        style={[styles.controls.control, style]}
      >
        {children}
      </TouchableHighlight>
    );
  }

  /**
   * Renders an empty control, used to disable a control without breaking the view layout.
   */
  renderNullControl() {
    return null;
  }

  /**
   * Groups the top bar controls together in an animated
   * view and spaces them out.
   */
  renderTopControls() {
    const backControl = !this.props.disableBack
      ? this.renderBack()
      : this.renderNullControl();
    const volumeControl = !this.props.disableVolume
      ? this.renderVolume()
      : this.renderNullControl();
    const fullscreenControl = !this.props.disableFullscreen
      ? this.renderFullscreen()
      : this.renderNullControl();

    return (
      <Animated.View
        style={[
          styles.controls.top,
          {
            opacity: this.animations.topControl.opacity,
            marginTop: this.animations.topControl.marginTop
          }
        ]}
      >
        <ImageBackground
          source={this.props.topBackground}
          style={[styles.controls.column]}
          imageStyle={[styles.controls.vignette]}
        >
          <View style={styles.controls.topControlGroup}>
            {backControl}
            <View style={styles.controls.pullRight}>
              {volumeControl}
              {fullscreenControl}
            </View>
          </View>
        </ImageBackground>
      </Animated.View>
    );
  }

  /**
   * Back button control
   */
  renderBack() {
    return this.renderControl(
      <Image source={this.props.backImage} style={styles.controls.back} />,
      this.methods.onBack,
      styles.controls.back
    );
  }

  /**
   * Render the volume slider and attach the pan handlers
   */
  renderVolume() {
    return (
      <VolumeSlider
        seekColor={this.props.seekColor}
        setVolume={volume => {
          this.setState(state => {
            return {
              ...state,
              volume,
              muted: volume <= 0
            };
          });
        }}
        volumeWidth={this.player.volumeWidth}
        iconOffset={this.player.iconOffset}
        volume={this.state.volume}
      />
    );
  }

  /**
   * Render fullscreen toggle and set icon based on the fullscreen state.
   */
  renderFullscreen() {
    const source =
      this.state.isFullscreen === true
        ? this.props.fullscreenImages.shrink
        : this.props.fullscreenImages.expand;
    return this.renderControl(
      <Image source={source} />,
      this.methods.toggleFullscreen,
      styles.controls.fullscreen
    );
  }

  /**
   * Render bottom control group and wrap it in a holder
   */
  renderBottomControls() {
    const playPauseControl = !this.props.disablePlayPause
      ? this.renderPlayPause()
      : this.renderNullControl();
    const timerControl = !this.props.disableTimer
      ? this.renderTimer()
      : this.renderNullControl();
    const seekbarControl = !this.props.disableSeekbar
      ? this.renderSeekbar()
      : this.renderNullControl();

    return (
      <Animated.View
        style={[
          styles.controls.bottom,
          {
            opacity: this.animations.bottomControl.opacity,
            marginBottom: this.animations.bottomControl.marginBottom
          }
        ]}
      >
        <ImageBackground
          source={this.props.bottomBackground}
          style={[styles.controls.column]}
          imageStyle={[styles.controls.vignette]}
        >
          {seekbarControl}
          <View
            style={[styles.controls.row, styles.controls.bottomControlGroup]}
          >
            {playPauseControl}
            {this.renderTitle()}
            {timerControl}
          </View>
        </ImageBackground>
      </Animated.View>
    );
  }

  /**
   * Render the seekbar and attach its handlers
   */
  renderSeekbar() {
    return (
      <View style={styles.seekbar.container}>
        <View
          style={styles.seekbar.track}
          onLayout={event => {
            this.player.seekerWidth = event.nativeEvent.layout.width;
          }}
        >
          <View
            style={[
              styles.seekbar.fill,
              {
                width: this.state.seekerFillWidth,
                backgroundColor: this.props.seekColor
              }
            ]}
          />
        </View>
        <View
          style={[styles.seekbar.handle, { left: this.state.seekerPosition }]}
          {...this.player.seekPanResponder.panHandlers}
        >
          <View
            style={[
              styles.seekbar.circle,
              { backgroundColor: this.props.seekColor }
            ]}
          />
        </View>
      </View>
    );
  }

  /**
   * Render the play/pause button and show the respective icon
   */
  renderPlayPause() {
    const source =
      this.state.paused === true ? this.props.playImage : this.props.pauseImage;
    return this.renderControl(
      <Image source={source} />,
      this.methods.togglePlayPause,
      styles.controls.playPause
    );
  }

  /**
   * Render our title...if supplied.
   */
  renderTitle() {
    if (this.opts.title) {
      if (this.props.renderTitle)
        return this.props.renderTitle(this.opts.title);
      return (
        <View style={[styles.controls.control, styles.controls.title]}>
          <Text
            style={[styles.controls.text, styles.controls.titleText]}
            numberOfLines={1}
          >
            {this.opts.title}
          </Text>
        </View>
      );
    }

    return null;
  }

  /**
   * Show our timer.
   */
  renderTimer() {
    const timerElem = this.props.renderTimer ? (
      this.props.renderTimer(this.calculateTime())
    ) : (
      <Text style={styles.controls.timerText}>{this.calculateTime()}</Text>
    );
    return this.renderControl(
      timerElem,
      this.methods.toggleTimer,
      styles.controls.timer
    );
  }

  /**
   * Show loading icon
   */
  renderLoader() {
    if (this.state.loading) {
      if (this.props.renderLoader) return this.props.renderLoader(this.state);
      return (
        <View style={styles.loader.container}>
          <Animated.Image
            source={this.props.loaderIcon}
            style={[
              styles.loader.icon,
              {
                transform: [
                  {
                    rotate: this.animations.loader.rotate.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg']
                    })
                  }
                ]
              }
            ]}
          />
        </View>
      );
    }
    return null;
  }

  renderError() {
    if (this.state.error) {
      if (this.props.renderError) return this.props.renderError(this.state);
      return (
        <View style={styles.error.container}>
          <Image source={this.props.errorIcon} style={styles.error.icon} />
          <Text style={styles.error.text}>
            Video unavailable: {this.state.errorMsg}
          </Text>
        </View>
      );
    }
    return null;
  }

  /**
   * Provide all of our options and render the whole component.
   */
  render() {
    return (
      <TouchableWithoutFeedback
        onPress={this.events.onScreenTouch}
        style={[styles.player.container, this.styles.containerStyle]}
      >
        <View style={[styles.player.container, this.styles.containerStyle]}>
          <Video
            {...this.props}
            ref={videoPlayer => {
              this.player.ref = videoPlayer;
            }}
            resizeMode={this.state.resizeMode}
            volume={this.state.volume}
            paused={this.state.paused}
            muted={this.state.muted}
            rate={this.state.rate}
            onLoadStart={this.events.onLoadStart}
            onProgress={this.events.onProgress}
            onError={this.events.onError}
            onLoad={this.events.onLoad}
            onEnd={this.events.onEnd}
            style={[styles.player.video, this.styles.videoStyle]}
            source={this.props.source}
          />
          {this.renderError()}
          {this.renderTopControls()}
          {this.renderLoader()}
          {this.renderBottomControls()}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
