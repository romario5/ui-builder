/**
 * @var {object} Object that contains CSS styles spell-checking regular expressions.
 * CSS spell-checking is not used, but may be implemented later for using in the developing mode.
 */
let styles = {
    // Border
    border : /(none|initial|\d{1,}px (solid|dashed|dotted) (#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\)))/i,
    borderLeft : /(none|initial|\d{1,}px (solid|dashed|dotted) (#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\)))/i,
    borderRight : /(none|initial|\d{1,}px (solid|dashed|dotted) (#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\)))/i,
    borderTop : /(none|initial|d\{1,}px (solid|dashed|dotted) (#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\)))/i,
    borderBottom : /(none|initial|\d{1,}px (solid|dashed|dotted) (#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\)))/i,
    borderRadius : /(none|0|initial|\d+(px|%|em|rem))/i,
    borderWidth : /(0|initial|\d+(px|%|em|rem))/i,
    borderColor : /(initial|#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\))/i,
    borderStyle : /(initial|solid|dotted|dashed)/i,
    // Font
    fontSize : /(initial|inherit|(\d+(px|em|rem|%)))/i,
    fontStyle : /(initial|inherit|italic|normal)/i,
    color : /(initial|#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\))/i,
    backgroundColor : /(initial|#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\))/i,
    // Width
    width : /(initial|inherit|auto|(\d+(px|em|rem|%)))/i,
    maxWidth : /(initial|inherit|auto|(\d+(px|em|rem|%)))/i,
    minWidth : /(initial|inherit|auto|(\d+(px|em|rem|%)))/i,
    // Height
    height : /(initial|inherit|auto|(\d+(px|em|rem|%)))/i,
    minHeight : /(initial|inherit|auto|(\d+(px|em|rem|%)))/i,
    maxHeight : /(initial|inherit|auto|(\d+(px|em|rem|%)))/i,
    display : /(none|block|inline|inline-block|flex|table|table-cell|table-row)/i,
    // Position
    position : /(initial|static|fixed|relativa|absolute)/i,
    top : /(initial|0|(-?\d+(px|em|rem|%)))/i,
    left : /(initial|0|(-?\d+(px|em|rem|%)))/i,
    bottom : /(initial|0|(-?\d+(px|em|rem|%)))/i,
    right : /(initial|0|(-?\d+(px|em|rem|%)))/i,
    // Margin
    margin : /(initial|0|(-?\d+(px|em|rem|%)(\s+-?\d+(px|em|rem|%)){0,3}))/i,
    marginTop : /(initial|0|(-?\d+(px|em|rem|%)))/i,
    marginLeft : /(initial|0|(-?\d+(px|em|rem|%)))/i,
    marginBottom : /(initial|0|(-?\d+(px|em|rem|%)))/i,
    marginRight : /(initial|0|(-?\d+(px|em|rem|%)))/i,
    // Padding
    padding : /(initial|0|(-?\d+(px|em|rem|%)(\s+-?\d+(px|em|rem|%)){0,3}))/i,
    paddingTop : /(initial|0|(-?\d+(px|em|rem|%)))/i,
    paddingLeft : /(initial|0|(-?\d+(px|em|rem|%)))/i,
    paddingBottom : /(initial|0|(-?\d+(px|em|rem|%)))/i,
    paddingRight : /(initial|0|(-?\d+(px|em|rem|%)))/i,
    // Shadows
    boxShadow : /(initial|none|(inset\s+)?-?\d+(px|em|rem|%)?\s+-?\d+(px|em|rem|%)?\s+\d+(px|em|rem|%)?\s+(\d+(px|em|rem|%)?\s+)?(#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\)))/i,
    textShadow : /(initial|none|(inset\s+)?-?\d+(px|em|rem|%)?\s+-?\d+(px|em|rem|%)?\s+\d+(px|em|rem|%)?\s+(\d+(px|em|rem|%)?\s+)?(#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\)))/i,
};