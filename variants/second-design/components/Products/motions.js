// Keyframes from Figma motion (node 830:2363): one 2s looping timeline.
// Each keyframe's easing applies until the next keyframe (same as motion.dev `ease` arrays).
const easeOut = "cubic-bezier(0, 0, 0.58, 1)";
const easeIn = "cubic-bezier(0.42, 0, 1, 1)";
const easeInOut = "cubic-bezier(0.42, 0, 0.58, 1)";
export const MOTION_DURATION = 2000;
export const MOTIONS = {
  // 830:2380 limits
  wobble: [{
    offset: 0,
    rotate: "0deg",
    easing: easeOut
  }, {
    offset: 0.12,
    rotate: "-10deg",
    easing: easeIn
  }, {
    offset: 0.2,
    rotate: "0deg",
    easing: easeOut
  }, {
    offset: 0.265,
    rotate: "-3.8deg",
    easing: easeIn
  }, {
    offset: 0.335,
    rotate: "0deg",
    easing: easeOut
  }, {
    offset: 0.38,
    rotate: "-1.2deg",
    easing: easeIn
  }, {
    offset: 0.45,
    rotate: "0deg",
    easing: "linear"
  }, {
    offset: 1,
    rotate: "0deg"
  }],
  // 833:1142, 833:1167 photos and 830:2421 left bank card
  swayLeft: [{
    offset: 0,
    rotate: "-5deg",
    easing: easeInOut
  }, {
    offset: 0.2,
    rotate: "-8deg",
    easing: easeInOut
  }, {
    offset: 0.5,
    rotate: "-2deg",
    easing: easeInOut
  }, {
    offset: 0.8,
    rotate: "-8deg",
    easing: easeInOut
  }, {
    offset: 1,
    rotate: "-5deg"
  }],
  // 830:2446 right bank card
  swayRight: [{
    offset: 0,
    rotate: "5deg",
    easing: easeInOut
  }, {
    offset: 0.2,
    rotate: "8deg",
    easing: easeInOut
  }, {
    offset: 0.5,
    rotate: "2deg",
    easing: easeInOut
  }, {
    offset: 0.8,
    rotate: "8deg",
    easing: easeInOut
  }, {
    offset: 1,
    rotate: "5deg"
  }],
  // 871:1968 Categories_Horizontal
  bounce: [{
    offset: 0,
    translate: "0 0",
    easing: easeOut
  }, {
    offset: 0.1,
    translate: "0 -18px",
    easing: easeIn
  }, {
    offset: 0.2,
    translate: "0 0",
    easing: easeOut
  }, {
    offset: 0.265,
    translate: "0 -7px",
    easing: easeIn
  }, {
    offset: 0.33,
    translate: "0 0",
    easing: easeOut
  }, {
    offset: 0.375,
    translate: "0 -2px",
    easing: easeIn
  }, {
    offset: 0.43,
    translate: "0 0",
    easing: "linear"
  }, {
    offset: 1,
    translate: "0 0"
  }]
};
