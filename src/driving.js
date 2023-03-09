// useful DOM nodes
const gameview = document.getElementById("gameview");
const course = document.getElementById("course");
const car = document.getElementById("car");
const everything = document.getElementById("everything");
const monitor = document.getElementById("monitor");
const actdisplay = document.getElementById("actdisplay");
const preddisplay = document.getElementById("preddisplay");

// model to load for driving predictions
// const driving_model = 'models/dagger-fix-5.onnx';
const driving_model = 'models/random.onnx';

// constants for Car environment
const frict = 0.02;         // all-directions friction
const crossfrict = 0.03;    // cross-track additional friction
const carsize = 0.6;        // scale the car graphic this much
const zoom = 3;             // scale the course graphic this much
const smoothrot = 1;        // how quickly do we rotate back to keeping the car vertical (1 = not, 0 = immediate)
const controlrad = 10;      // how big a circle can the target point be in for step2()
const maxturn = 0.25;       // inverse of turning radius (e.g., 0.25 means we can turn in a radius-4 circle)

const n_gates = 5;
var gate_progress = 0;
var gate_transforms = [];
var chronometer_start = 0;
var chronometer_since_last_gate = 0;
var chronometer_pause_start = 0;
var chronometer_pause_offset = 0;
var chronometer_pause_offset_since_last_gate = 0;

// level selector changes this
var speedlimit = 0.8;       // maximum speed (in SVG units per frame); minimum is always 0

// background selector changes this
var background_seed = 1234;
var background_source = "map"  // between {"map", "random", "seed"}

// object and method definitions for Car environment
function Car() {}

const rock_path = "m 27.060839,151.22234 -0.872416,7.73863 -3.599411,7.25972 -7.629469,1.56165 -8.0166825,-1.17986 -3.8428547,-6.77348 -1.3551722,-7.98892 5.2544543,-5.74789 7.1791401,-3.75756 7.090286,3.22109 z"
const water_blobs = [
   "M386,264.5Q375,289,369,316.5Q363,344,332,345Q301,346,290.5,407.5Q280,469,245.5,438Q211,407,193,380Q175,353,177.5,321.5Q180,290,102,304.5Q24,319,23,279.5Q22,240,91.5,225.5Q161,211,133.5,169Q106,127,154,150.5Q202,174,210,145Q218,116,238.5,125Q259,134,290,117Q321,100,334.5,124.5Q348,149,338.5,178Q329,207,363,223.5Q397,240,386,264.5Z",
   "M367,259Q346,278,336.5,295.5Q327,313,335,365.5Q343,418,307.5,421Q272,424,236,445.5Q200,467,181.5,420.5Q163,374,140.5,358Q118,342,94,322Q70,302,63.5,271Q57,240,65,209.5Q73,179,93,156Q113,133,150.5,141.5Q188,150,196,93.5Q204,37,230,94Q256,151,306.5,94.5Q357,38,360,87.5Q363,137,393,155Q423,173,405.5,206.5Q388,240,367,259Z",
   "M351,259.5Q348,279,376.5,328.5Q405,378,344.5,347.5Q284,317,282.5,396Q281,475,247.5,431.5Q214,388,203.5,355Q193,322,175.5,315.5Q158,309,133,298.5Q108,288,116,264Q124,240,145,226.5Q166,213,166,195.5Q166,178,170,152Q174,126,189,80Q204,34,234,67.5Q264,101,288,108.5Q312,116,352.5,114Q393,112,369.5,156.5Q346,201,350,220.5Q354,240,351,259.5Z",
   "M417.5,261.5Q357,283,366.5,318.5Q376,354,336,346Q296,338,276.5,338Q257,338,244.5,313Q232,288,211.5,306Q191,324,133.5,351Q76,378,90,334Q104,290,127,265Q150,240,128.5,216Q107,192,141.5,189Q176,186,151,114.5Q126,43,168,57Q210,71,239,76.5Q268,82,280.5,115.5Q293,149,314.5,154.5Q336,160,380.5,166.5Q425,173,451.5,206.5Q478,240,417.5,261.5Z",
   "M362.5,262.5Q363,285,354,306.5Q345,328,345,375.5Q345,423,306,409Q267,395,241,390Q215,385,179.5,395.5Q144,406,140.5,366Q137,326,126.5,305.5Q116,285,128,262.5Q140,240,97.5,206.5Q55,173,104.5,170.5Q154,168,143.5,111.5Q133,55,176,88.5Q219,122,236,143.5Q253,165,287,132.5Q321,100,334,125Q347,150,354.5,173Q362,196,362,218Q362,240,362.5,262.5Z",
   "M430,278.5Q451,317,407.5,330.5Q364,344,322.5,327.5Q281,311,270.5,333.5Q260,356,234,389Q208,422,181,405.5Q154,389,152.5,351.5Q151,314,115.5,306Q80,298,74,269Q68,240,44.5,200Q21,160,48.5,131Q76,102,101,72.5Q126,43,175.5,98Q225,153,251,92.5Q277,32,307,52Q337,72,346.5,107Q356,142,337,177Q318,212,363.5,226Q409,240,430,278.5Z",
   "M402,268Q411,296,418,335.5Q425,375,386,381Q347,387,321.5,399Q296,411,268,439Q240,467,219,418Q198,369,179.5,358.5Q161,348,151,330Q141,312,119.5,299Q98,286,62.5,263Q27,240,64,217.5Q101,195,121,181.5Q141,168,133.5,126Q126,84,158,84.5Q190,85,215,65.5Q240,46,273.5,40.5Q307,35,335.5,52Q364,69,379,98.5Q394,128,418.5,151Q443,174,418,207Q393,240,402,268Z",
   "M437.5,273.5Q447,307,437.5,342Q428,377,394.5,392Q361,407,331,417Q301,427,270.5,446Q240,465,204.5,461Q169,457,161.5,407.5Q154,358,146.5,335.5Q139,313,81.5,311.5Q24,310,33.5,275Q43,240,40.5,207Q38,174,49,141.5Q60,109,111,121Q162,133,167.5,83Q173,33,206.5,20.5Q240,8,275.5,14.5Q311,21,322,66Q333,111,377.5,109.5Q422,108,444,137.5Q466,167,447,203.5Q428,240,437.5,273.5Z",
   "M390.5,261Q369,282,366,305.5Q363,329,337.5,334Q312,339,297.5,355Q283,371,261.5,398Q240,425,207,434.5Q174,444,146.5,425.5Q119,407,106.5,376.5Q94,346,64,326.5Q34,307,46,273.5Q58,240,69.5,214Q81,188,79.5,155Q78,122,107.5,110Q137,98,158.5,76.5Q180,55,210,31.5Q240,8,272,25Q304,42,329.5,61.5Q355,81,390.5,93Q426,105,422.5,143.5Q419,182,415.5,211Q412,240,390.5,261Z"
]
const racing_maps = [
  {
    "name": "Val-d'Or",
    "path": "M 84 85 C 99 87 153 83 161 113 C 163 121 143 126 147 133 C 154 145 187 140 184 153 C 179 170 153 170 137 174 C 126 177 113 178 102 173 C 95 170 95 159 90 152 C 82 142 76 130 66 124 C 54 118 34 129 27 118 C 19 106 24 86 35 78 C 42 72 49 92 57 93 C 66 94 75 88 84 85 Z",
    "starting_positions": [
      [86.2324, 145.2296, 5.72129444651556],
      [58.3328, 121.42519999999999, 4.668926289341032],
      [46.9428, 82.7756, 2.451093515972522],
      [69.4672, 90.19839999999999, 1.1838801638726422],
      [100.9504, 85.5908, 1.629562927347076],
      [158.6688, 117.458, 3.8304977080459848],
      [182.0892, 156.6196, 3.830497708045977],
      [167.2436, 167.24200000000002, 4.420970420610537]
    ]
  },
  {
    "name": "Amos",
    "path": 
    'M 29 147 C 29 147 33 160 38 161 C 56 165 75 159 93 162 C 131 169 187 218 187 131 C 187 70 134 72 93 72 C 85 72 78 75 72 80 C 54 95 82 102 90 105 C 92 106 110 111 102 119 C 89 134 72 121 57 121 C 52 120 45 119 41 122 C 35 129 27 137 29 147 Z',
    "starting_positions": [
      [78.6816, 162.3504, 4.738028496003016],
      [33.5048, 154.5436, 6.067900425631497],
      [44.2552, 120.7568, 1.410965616690718],
      [102.998, 108.9828, 5.144743394569102],
      [65.628, 84.0268, 0.7328064677736794],
      [96.2148, 70.2048, 1.5374718621872414],
      [164.684, 81.7232, 2.477564811217161],
      [187.4644, 148.5284, 3.1870223772238226],
      [167.8836, 179.8836, 4.439405781409934]
    ]
  },
  {
    "name": "Gaspé",
    "path": "M 50 74 C 32 81 31 105 42 116 C 48 122 66 107 75 110 C 103 118 125 139 153 150 C 159 152 166 156 170 162 C 177 173 173 189 161 190 C 144 191 145 180 131 178 C 126 177 120 183 115 183 C 57 177 114 123 117 101 C 118 94 115 87 111 80 C 109 76 87 60 50 74 Z",
    "starting_positions": [
      [39.136, 110.0068, 5.874327180453816],
      [44.3832, 76.348, 1.1221217089431226],
      [103.38199999999999, 73.0204, 1.9937087324599343],
      [93.9112, 173.9964, 2.3258949952434325],
      [120.53119999999998, 180.5232, 1.234212003255555],
      [155.8536, 188.97, 1.6704804519767578],
      [168.3956, 158.1268, 5.460647151552681],
      [155.98160000000001, 150.32, 5.10294979114236]
    ]
  },
  {
    "name": "Magog",
    "path": "M 55 108 C 54 131 43 157 55 176 C 62 188 85 183 95 174 C 103 167 93 153 93 142 C 93 130 92 118 94 106 C 96 91 120 91 128 90 C 132 90 136 90 139 92 C 143 96 146 102 147 108 C 151 126 147 146 151 164 C 153 171 164 203 182 183 C 191 172 185 133 183 123 C 182 111 185 97 179 87 C 175 80 165 79 156 78 C 139 76 122 78 104 78 C 98 78 92 77 85 78 C 76 80 65 80 58 87 C 53 92 55 101 55 108 Z",
    "starting_positions": [
      [71.51480000000001, 182.4716, 1.463088402406204],
      [98.3908, 158.7952, 5.902635821973703],
      [98.9024, 96.8532, 1.04592922893123],
      [145.1032, 98.0048, 2.7707013647771257],
      [154.0616, 168.64960000000002, 2.746755300950018],
      [186.1848, 171.97719999999998, 0.032152658370706945],
      [184.6488, 121.6812, 6.220754335284434],
      [171.2108, 79.19200000000001, 4.865074444433182],
      [55.5176, 90.19839999999999, 3.3247449257534685]
    ]
  },
  {
    "name": "Rimouski",
    "path": "M 54 76 C 47 79 43 88 40 96 C 34 115 35 137 42 156 C 47 166 50 179 60 186 C 67 191 77 186 86 187 C 98 187 134 195 147 181 C 152 175 157 163 152 157 C 139 142 127 147 117 154 C 113 157 112 164 107 166 C 102 169 96 168 90 167 C 83 166 73 161 69 154 C 64 144 65 134 65 124 C 65 120 67 107 69 104 C 71 100 73 96 77 94 C 89 90 92 102 90 108 C 89 114 93 119 96 120 C 103 122 111 110 117 112 C 125 115 126 123 127 127 C 129 135 141 137 145 135 C 159 129 164 112 162 100 C 162 96 161 92 159 89 C 154 84 148 78 141 75 C 122 68 68 70 54 76 Z",
    "starting_positions": [
      [67.2916, 107.4756, 0.2552155806837025],
      [104.4056, 166.858, 4.547219185429837],
      [148.3028, 133.0712, 0.9357976486638339],
      [158.2852, 86.4868, 5.406973548372024],
      [44.3832, 84.9512, 3.648632183547616],
      [45.4072, 159.17919999999998, 2.80841854095471],
      [74.5864, 187.2068, 1.4424475054972796],
      [141.2636, 184.5192, 1.0563897917265608]
    ]
  },
  {
    "name": "Tremblant",
    "path": "M 147 222 C 163 220 176 202 168 187 C 165 181 162 177 155 174 C 151 172 145 172 140 173 C 129 173 123 175 122 162 C 121 158 123 155 125 152 C 130 141 135 144 146 138 C 152 135 161 132 162 124 C 163 118 164 111 162 106 C 158 96 141 96 134 96 C 128 97 123 99 117 101 C 115 102 104 109 102 109 C 98 109 93 109 89 107 C 84 105 82 105 79 101 C 77 99 78 96 79 94 C 80 92 83 90 85 88 C 87 84 88 80 88 76 C 88 67 81 65 73 64 C 67 63 59 61 53 64 C 36 71 46 81 48 85 C 52 95 47 98 36 95 C 29 94 15 89 13 97 C 11 103 9 106 10 113 C 11 119 14 125 17 131 C 19 134 21 138 24 139 C 29 142 38 151 50 137 C 58 129 82 130 87 139 C 89 143 91 147 92 151 C 93 157 93 162 91 167 C 88 180 73 185 67 197 C 66 201 64 204 63 209 C 63 217 65 226 74 229 C 80 231 94 232 102 229 C 106 228 109 218 111 215 C 113 213 116 211 119 210 C 125 208 129 213 134 216 C 138 218 144 222 147 222 Z",
    "starting_positions": [
      [142.5048, 95.6848, 4.71238898038469],
      [85.226, 65.4012, 4.917772831423562],
      [42.8292, 95.5116, 4.877558482455706],
      [9.604000000000001, 103.99080000000001, 3.2464379287141867],
      [44.3868, 141.1964, 0.9097175966988656],
      [90.2444, 141.5424, 2.65161133175126],
      [83.14959999999999, 178.7476, 4.0464270344519875],
      [104.43440000000001, 225.6436, 0.6433778308329223],
      [154.4452, 219.41400000000002, 0.9024674649003968],
      [153.0608, 171.99880000000002, 4.760013920727199]
    ]
  },
  {
    "name": "Matane",
    "path": "M 90 69 C 81 77 67 88 66 101 C 65 109 75 114 77 122 C 79 127 79 133 77 139 C 76 142 74 144 71 145 C 61 149 56 147 47 143 C 44 141 42 137 38 137 C 27 139 24 142 20 147 C 15 152 10 160 12 167 C 14 179 26 187 36 193 C 44 198 55 197 65 198 C 72 199 79 198 86 198 C 96 198 107 199 117 199 C 128 199 139 199 149 199 C 157 199 166 200 171 195 C 194 177 192 166 175 149 C 173 146 166 143 163 145 C 160 147 147 153 143 155 C 136 157 134 151 131 145 C 129 143 128 140 127 137 C 126 130 125 124 131 120 C 138 114 157 112 151 96 C 143 72 136 68 116 65 C 108 64 96 64 90 69 Z",
    "starting_positions": [
      [145.10039999999998, 77.3416, 2.553530782002581],
      [144.5816, 111.2588, 4.317536314227688],
      [145.27360000000002, 152.7904, 1.2627869124100068],
      [182.998, 155.7324, 2.3883981181616014],
      [34.004000000000005, 189.9956, 5.191884983525661],
      [16.526, 150.3676, 0.46376317585571725],
      [77.612, 133.928, 0],
      [70.69, 87.3784, 0.6640488727362819],
      [147.69639999999998, 198.302, 4.71238898038469]
    ]
  },
  {
    "name": "Alma",
    "path": "M 52 159 C 72 158 93 162 114 160 C 119 159 124 155 124 150 C 125 145 122 137 117 136 C 95 132 72 139 49 135 C 45 134 41 122 44 118 C 45 116 47 114 49 114 C 72 113 95 118 117 115 C 121 114 124 108 123 104 C 123 101 120 96 116 95 C 93 92 69 98 46 94 C 42 94 40 87 40 83 C 40 80 42 75 45 75 C 76 73 107 74 138 76 C 142 76 146 77 147 80 C 150 84 150 89 150 94 C 150 117 151 141 149 165 C 148 170 146 175 142 178 C 140 180 137 179 134 179 C 106 179 77 181 49 178 C 41 177 42 166 45 162 C 46 160 49 159 52 159 Z",
    "starting_positions": [
      [112.9136, 134.40879999999999, 4.783678844390849],
      [53.904399999999995, 157.7704, 1.5323195932137077],
      [45.251999999999995, 127.1408, 6.004972872056156],
      [130.7376, 178.19, 4.71238898038469],
      [150.11880000000002, 81.9752, 2.9763971224058166],
      [49.232, 74.1884, 1.5181685690221054],
      [108.9336, 159.5008, 1.4601672952810247]
    ]
  }
]


function compute_angle_between_two_points(x1, x2, y1, y2, radian=true){
  // compute the angle taking point 1 towards point 2, both placed arbitrarily in the html space
  // returns an angle in radians where 0 indicates that point 2 is straight above point 1

  var angle
  if (y1 == y2){
    if (x1 > x2) {
      angle = 3 * Math.PI / 2
    } else {
      angle = Math.PI / 2
    }
  } else if (x1 == x2) {
    if (y1 > y2) {
      angle = 0
    } else {
      angle = Math.PI
    }
  } else {
    var invert = false
    if (y2 > y1) {
      invert = true
    }
    if (x1 > x2) {
      invert = !invert
    }

    if (invert) {
      angle = Math.atan(Math.abs((y1 - y2)/(x2 - x1)))
    } else {
      angle = Math.atan(Math.abs((x2 - x1)/(y1 - y2)))
    }
    if (x2 < x1) {
      angle += Math.PI
      if (y2 < y1) {
        angle += Math.PI / 2
      }
    } else if (y2 > y1) {
      angle += Math.PI / 2
    }
  }
  if (!radian){
    angle = angle / (2 * Math.PI) * 360
  }
  return angle
}

function project_point_on_path(path, point) {
  // Args
  //   path: document object
  //   point: Array with x coord in pos 0, y coord in pos 1
  //
  // Returns
  //   coordinate along the path (1D) to which the point is the closest

  var total_length = path.getTotalLength()

  var closest_distance = 9999999
  var closest_percentile, curr_percentile, curr_point, curr_distance

  // find closest percentile of the road
  for (var i=0; i<100; i++){
    curr_percentile = i / 100
    curr_point = path.getPointAtLength(curr_percentile * total_length)
    curr_distance = (curr_point.x - point[0]) ** 2 + (curr_point.y - point[1]) ** 2  // no need to take the sqrt
    if (curr_distance < closest_distance){
      closest_distance = curr_distance
      closest_percentile = curr_percentile
    }
  }

  // refine projection
  var search_offset = (closest_percentile - 0.005) * total_length
  closest_distance = 9999999
  for (var i=0; i<20; i++){
    curr_percentile = i / 2000
    curr_point = path.getPointAtLength(search_offset + curr_percentile * total_length)
    curr_distance = (curr_point.x - point[0]) ** 2 + (curr_point.y - point[1]) ** 2
    if (curr_distance < closest_distance){
      closest_distance = curr_distance
      closest_point = search_offset + curr_percentile * total_length
    }
  }
  return closest_point
}

function resetMap() {
  var map_id = document.getElementById('mapSelectBox').value - 1
  if (map_id == -1){
    map_id = Math.floor(Math.random()*racing_maps.length)
  }

  var racing_map = racing_maps[map_id]
  var road_coordinates = racing_map.path;

  var position_id = document.getElementById('startingPosSelectBox').value - 1
  if (position_id == -1) {
    position_id = Math.floor(Math.random()*racing_map.starting_positions.length)
  }
  var starting_position = racing_map.starting_positions[position_id];

  setBackground()

  document.getElementById("underneath-road").setAttribute("d", road_coordinates);
  document.getElementById("road-tarmac").setAttribute("d", road_coordinates);
  document.getElementById("road-centerline").setAttribute("d", road_coordinates);

  var starting_line = document.getElementById("starting_line")
  
  var tarmac = document.getElementById("road-tarmac")
  var starting_point = project_point_on_path(tarmac, starting_position)
  var attached_starting_pt = tarmac.getPointAtLength(starting_point)
  var attached_starting_pt2 = tarmac.getPointAtLength(starting_point + 0.01)

  var line_angle = compute_angle_between_two_points(
    attached_starting_pt.x,
    attached_starting_pt2.x,
    attached_starting_pt.y,
    attached_starting_pt2.y,
    radian=false
  )
  starting_line.setAttribute("transform", "translate(" + (attached_starting_pt.x - 4.5) + ", " + (attached_starting_pt.y - 1) + ") rotate(" + line_angle + ", " + 4.5 + "," + 1 + ")")
  gate_transforms[0] = [[-(attached_starting_pt.x - 4.5), -(attached_starting_pt.y - 1)], [line_angle, 4.5, 1]]

  // Add gates
  var ns = 'http://www.w3.org/2000/svg';
  var gates_group = document.getElementById("gates_group")
  var course_length = tarmac.getTotalLength()
  var gate_pt1, gate_pt2;

  gates_group.innerHTML = ''
  for (var i=1; i<n_gates; i++){

    var t = i/n_gates * course_length + starting_point
    if (t > course_length) {
      t -= course_length
    }
    gate_pt1 = tarmac.getPointAtLength(t)
    gate_pt2 = tarmac.getPointAtLength(t + 0.01)
    var line_angle = compute_angle_between_two_points(
      gate_pt1.x,
      gate_pt2.x,
      gate_pt1.y,
      gate_pt2.y,
      radian=false
    )

    var gate = document.createElementNS(ns, "rect")
    if (i == 0) {
      gate.setAttribute("style", "fill:#760505;stroke:none;")
    } else {
      gate.setAttribute("style", "fill:#76050592;stroke:none;")
    }
    gate.setAttribute("x", "0")
    gate.setAttribute("y", "0")
    gate.setAttribute("width", "9.2")
    gate.setAttribute("height", "2")
    gate.setAttribute("transform", "translate(" + (gate_pt1.x - 4.6) + ", " + (gate_pt1.y - 1) + ") rotate(" + line_angle + ", " + 4.6 + "," + 1 + ")")
    gate.setAttribute("id", "gate" + i)
    gate_transforms[i] = [[-(gate_pt1.x - 4.6), -(gate_pt1.y - 1)], [line_angle, 4.6, 1]] 
    gates_group.appendChild(gate)
  }

  var real_starting_pos = tarmac.getPointAtLength(closest_point - 8)
  var real_starting_pos2 = tarmac.getPointAtLength(closest_point - 7.9)
  var real_starting_th = compute_angle_between_two_points(
    real_starting_pos.x,
    real_starting_pos2.x,
    real_starting_pos.y,
    real_starting_pos2.y
  )

  state.x = real_starting_pos.x;
  state.y = real_starting_pos.y;
  state.th = real_starting_th;
  state.dx = 0;
  state.dy = 0;

  gate_progress = 0;
  chronometer_start = Date.now();
  chronometer_since_last_gate = 0;
  chronometer_pause_offset = 0;
  chronometer_pause_start = 0;
  chronometer_pause_offset_since_last_gate = 0;
  document.getElementById("numberOfLaps").innerHTML = "0"
  document.getElementById("previousTime").innerHTML = "0:00"
  document.getElementById("sumOfBestSegments").innerHTML = "0:00"

  

  var score_table = document.getElementById("scoreTable")
  score_table.innerHTML = ''
  var row = score_table.insertRow()
  var cell0 = row.insertCell(0);
  var cell1 = row.insertCell(1);
  var cell2 = row.insertCell(2);
  cell1.innerHTML = "Best"
  cell2.innerHTML = "+/-"

  for (var i=1; i<=n_gates; i++){
    row = score_table.insertRow(-1);
    row.style.backgroundColor = "#eeeeee"
    cell0 = row.insertCell(0);
    cell1 = row.insertCell(1);
    cell2 = row.insertCell(2);
    if (i == n_gates) {
      cell0.innerHTML = "Final gate"
    } else {
      cell0.innerHTML = `Gate ${i}`
    }
    cell1.innerHTML = "-"
    cell2.innerHTML = "-"
    row.id = `leaderboard_row_id_${i-1}`
    cell0.id = `leaderboard_gate_id_${i-1}`
    cell1.id = `leaderboard_best_id_${i-1}`
    cell2.id = `leaderboard_diff_id_${i-1}`
  }

  state.renderSVG(car, everything);
}

function populateMapSelectBox() {
  var map_select = document.getElementById('mapSelectBox');

  for (var i=0; i<racing_maps.length; i++){
    map_select.options[i+1] = new Option(racing_maps[i].name, i+1);
  }

  map_select.value = Math.floor(Math.random()*racing_maps.length) + 1
  populateStartingPositionBox()
}

function populateStartingPositionBox() {
  var position_select = document.getElementById('startingPosSelectBox')
  var map_id = document.getElementById('mapSelectBox').value
  var num_positions = racing_maps[map_id - 1].starting_positions.length

  position_select.length = 1  // only keep the "random" option, discard the rest

  for (var i=0; i<num_positions; i++){
    position_select.options[i+1] = new Option(i+1, i+1)
  }
  position_select.value = 1
}

function random(seed) {
  // good enough PRNG
  var x = Math.sin(seed + 0.1) * 10001;
  var rnd = x - Math.floor(x);
  var next_seed = Math.floor(rnd * 10000000);
  return [rnd, next_seed];
}

function setBackground() {
  var active_seed = background_seed
  if (background_source == "map"){
    active_seed = document.getElementById("mapSelectBox").value - 1
  } else if (background_source == "random"){
    active_seed = Math.floor(Math.random() * 10000)
  }

  const biomes = [["#788921", "#00428e", 15, 15], ["#406e15", "#223D5B", 0, 30], ["#A89278", "#44634F", 45, 0]]
  var [biome_rng, active_seed] = random(active_seed)
  var [bg_color, water_color, n_rocks, n_bushes] = biomes[Math.floor(biome_rng * biomes.length)]

  document.getElementById("background").setAttribute("style", "fill:" + bg_color + ";stroke:none;")

  var ns = 'http://www.w3.org/2000/svg';
  var rocks_group = document.getElementById("rocks")

  rocks_group.innerHTML = ''
  for (var i=0; i<n_rocks; i++){
    var [x_coord_rng, active_seed] = random(active_seed)
    var [y_coord_rng, active_seed] = random(active_seed)

    var path = document.createElementNS(ns,'path');
    path.setAttribute('style', "fill:#917c6f;stroke:#000000;stroke-width:0.5;stroke-linejoin:round;");
    path.setAttribute("transform", "matrix(0.4,0,0,0.4," + (x_coord_rng*250 - 25)  + "," + (y_coord_rng*250 - 50) + ")");
    path.setAttribute('d', rock_path);
    rocks_group.appendChild(path)
  }

  [num_rng, active_seed] = random(active_seed)

  var bush_group = document.getElementById("bush_group")
  bush_group.innerHTML = ''
  for (var i=0; i<n_bushes; i++){
    var [x_coord_rng, active_seed] = random(active_seed)
    var [y_coord_rng, active_seed] = random(active_seed)

    var tree = document.createElementNS(ns, "circle")
    var cx = x_coord_rng*220
    var cy = y_coord_rng*220 + 30

    tree.setAttribute("style", "fill:#445016;stroke:#000000;stroke-width:0.21;")
    tree.setAttribute("r", "10")
    tree.setAttribute("cx", cx)
    tree.setAttribute("cy", cy)
    bush_group.appendChild(tree)

    var [r_diff_rng, active_seed] = random(active_seed)
    var [angle_rng, active_seed] = random(active_seed)
    r_diff_rng = r_diff_rng * 10
    r_diff_rng = r_diff_rng + Math.sign(r_diff_rng) * 8
    angle_rng = angle_rng * 360

    var tree = document.createElementNS(ns, "circle")
    tree.setAttribute("style", "fill:#445500;stroke:#000000;stroke-width:0.21;")
    tree.setAttribute("r", "5")
    tree.setAttribute("cx", cx + r_diff_rng)
    tree.setAttribute("cy", cy)
    tree.setAttribute("transform", "rotate(" + angle_rng + "," + cx + "," + cy + ")")
    bush_group.appendChild(tree)

    var [r_diff_rng, active_seed] = random(active_seed)
    var [angle_rng, active_seed] = random(active_seed)
    r_diff_rng = r_diff_rng * 10
    r_diff_rng = r_diff_rng + Math.sign(r_diff_rng) * 8
    angle_rng = angle_rng * 360

    var tree = document.createElementNS(ns, "circle")
    tree.setAttribute("style", "fill:#668000;stroke:#000000;stroke-width:0.21;")
    tree.setAttribute("r", "3.5")
    tree.setAttribute("cx", cx + r_diff_rng)
    tree.setAttribute("cy", cy)
    tree.setAttribute("transform", "rotate(" + angle_rng + "," + cx + "," + cy + ")")
    bush_group.appendChild(tree)
  }

  var [lake_rng, active_seed] = random(active_seed)
  var [lake_pos_rng, active_seed] = random(active_seed)

  const lake_pos = [[-250, 200], [100, 500], [300, 300]]
  var [lake_pos_x, lake_pos_y] = lake_pos[Math.floor(lake_pos_rng * lake_pos.length)]

  var water = document.getElementById("water")

  water.setAttribute("d", water_blobs[Math.floor(lake_rng * water_blobs.length)])
  water.setAttribute("transform", "scale(0.33 0.33) translate(" + lake_pos_x + "," + lake_pos_y + ")")
  water.setAttribute("style", "fill:" + water_color + ";fill-opacity:1;stroke:#000000;stroke-width:0.9px;stroke-linejoin:round;")

}

// Reset to initial state. Note that coordinates are in the frame of the SVG everything element (i.e., the entire
// course), so +x is down, +y is left. By convention, +th is clockwise and th=0 is along -y (to the right).
Car.prototype.reset = function () {
    resetMap()
    this.dx = 0;
    this.dy = 0;
}

const svg = document.getElementsByTagName('svg')[0];
const point = svg.createSVGPoint();

function rotate(cx, cy, x, y, angle) {
  var radians = (Math.PI / 180) * angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
      ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  return [nx, ny];
}

// step forward with action (angvel, accel)
// if we were in gym, we'd want to package up action as a tuple, and declare a Box action space
// reasonable limits are [-6,6] for angvel, and [-3, 2] for accel 
Car.prototype.step = function (angvel, accel) {
   
    // adjust acceleration
    point.x = this.x
    point.y = this.y
    var current_frict = frict
    var road_border = document.getElementById("underneath-road")
    var tarmac = document.getElementById("road-tarmac")
    if (!tarmac.isPointInStroke(point)) {
      if (road_border.isPointInStroke(point)) {
        current_frict *= 2. 
      } else {
        current_frict *= 4.
      }
    }

    let cth = Math.cos(this.th);
    let sth = Math.sin(this.th);
    this.dx += 0.02 * accel * sth;
    this.dy -= 0.02 * accel * cth;
    this.dx *= (1-current_frict);
    this.dy *= (1-current_frict);
    let along = this.dx * sth - this.dy * cth;
    let across = this.dx * cth + this.dy * sth;
    if (across > crossfrict) {
        across -= crossfrict;
    } else if (across < -crossfrict) {
        across += crossfrict;
    } else {
        across = 0;
    }
    if (along > speedlimit) {
        along = speedlimit;
    } else if (along < 0) {
        along = 0;
    }
    this.dx = along * sth + across * cth;
    this.dy = -along * cth + across * sth;
    if ((this.x < 0) && (this.dx < 0)) {
        this.dx = 0;
    } else if ((this.x > 200) && (this.dx > 0)) {
        this.dx = 0;
    }
    if ((this.y < 40) && (this.dy < 0)) {
        this.dy = 0;
    } else if ((this.y > 240) && (this.dy > 0)) {
        this.dy = 0;
    }
    this.x += this.dx;
    this.y += this.dy;
    this.th += angvel * .01;
    if (this.th > Math.PI) {
        this.th -= 2*Math.PI;
    } else if (this.th < -Math.PI) {
        this.th += 2*Math.PI;
    }
    // if we were in gym, we'd want to return observation, reward, done, diagnostic info
    // but we don't always want to compute the full observation, we haven't defined a reward, and done is always false

    var hasnt_started_yet = document.getElementById("numberOfLaps").innerHTML == "0"
    if (!hasnt_started_yet) {
      var elapsed_time = Date.now() - chronometer_start - chronometer_pause_offset
      var minutes = Math.floor(elapsed_time / 60000)
      elapsed_time = elapsed_time % 60000
      var seconds = "00" + elapsed_time.toString().slice(0, -3)
      document.getElementById("chronometer_seconds").innerHTML = minutes + ":" + (seconds).substring(seconds.length -2);
      document.getElementById("chronometer_milliseconds").innerHTML = "." + elapsed_time.toString().slice(-3, -1);
    }

    // activate gates
    point.x = this.x
    point.y = this.y
    
    var current_gate  // the gate you need to cross next
    if (gate_progress == 0){
      current_gate = document.getElementById("starting_line")
    } else {
      current_gate = document.getElementById("gate" + gate_progress)
    }

    var trs = gate_transforms[gate_progress]
    point.x += trs[0][0]
    point.y += trs[0][1]
    var res = rotate(trs[1][1], trs[1][2], point.x, point.y, trs[1][0])
    point.x = res[0]
    point.y = res[1]

    if (current_gate.isPointInFill(point)) {
      var leaderboard_row = document.getElementById(`leaderboard_row_id_${gate_progress}`)
      leaderboard_row.style.backgroundColor = "#cccccc"
      if (gate_progress > 0) {
        var leaderboard_row = document.getElementById(`leaderboard_row_id_${(gate_progress - 1)}`)
        leaderboard_row.style.backgroundColor = "#dddddd"
      } else {
        for (var i=1; i<n_gates; i++) {
          var leaderboard_row = document.getElementById(`leaderboard_row_id_${i}`)
          leaderboard_row.style.backgroundColor = "#eeeeee"
        }
      }
      
      var current_time = null
      if (!hasnt_started_yet) {
        var leaderboard_best = document.getElementById(`leaderboard_best_id_${(gate_progress + n_gates - 1) % n_gates}`)
        current_time = Date.now() - chronometer_since_last_gate - chronometer_pause_offset_since_last_gate

        current_time /= 1000
        if (leaderboard_best.innerHTML == "-") {
          leaderboard_best.innerHTML = current_time.toFixed(3)
        } else {
          var leaderboard_diff = document.getElementById(`leaderboard_diff_id_${(gate_progress + n_gates - 1) % n_gates}`)
          var last_best = parseFloat(leaderboard_best.innerHTML)
          if (last_best >= current_time) {
            leaderboard_best.innerHTML = current_time.toFixed(3)
            leaderboard_diff.innerHTML = "-" + (last_best - current_time).toFixed(3)
            leaderboard_diff.style = "color: green; font-weight: bold"
          } else {
            leaderboard_diff.innerHTML = "+" + (current_time - last_best).toFixed(3)
            leaderboard_diff.style = "color: red; font-weight: normal;"
          }
        }

        var best_sum = 0;
        for (var i=0; i<n_gates; i++){
          var leaderboard_best = document.getElementById(`leaderboard_best_id_${i}`).innerHTML
          if (leaderboard_best != "-") {
            best_sum += parseFloat(leaderboard_best)
          }
        }
        document.getElementById("sumOfBestSegments").innerHTML = best_sum.toFixed(3)

        chronometer_since_last_gate = Date.now()
        chronometer_pause_offset_since_last_gate = 0
      }

      if (gate_progress == 0) {
        for (var i=1; i<n_gates; i++) {
          current_gate = document.getElementById("gate" + i)
          current_gate.setAttribute("style", "fill:#76050592;stroke:none;")
        }
        // start timer
        chronometer_start = Date.now()
        chronometer_pause_offset = 0
        var lap_counter = document.getElementById("numberOfLaps")
        lap_counter.innerHTML = parseInt(lap_counter.innerHTML) + 1
        
        if (current_time != null) {
          document.getElementById("previousTime").innerHTML = document.getElementById("chronometer_seconds").innerHTML + document.getElementById("chronometer_milliseconds").innerHTML
        }

      } else {
        current_gate.setAttribute("style", "fill:#760505;stroke:none;")
      }
      gate_progress = (gate_progress + 1) % n_gates

      if (gate_progress == 0) {
        // pass
      } else {
        current_gate = document.getElementById("gate" + gate_progress)
        current_gate.setAttribute("style", "fill:#E56B00;stroke:none;")
      }
    }
}

// Alternate version of step(): controls are a target point (tx, ty) instead of (accel, angvel). Wraps step()
// by transforming controls. Note that the car uses course coordinates (see reset() function above) while this 
// controller works in standard coordinates (+y is up, +x is right, +theta is counterclockwise). That means
// we need to transform coordinates whenever we read or write to the car.
Car.prototype.step2 = function(tx, ty) {
    let carth = -this.th;
    let cardx = -this.dy;
    let cardy = -this.dx;
    let cth = Math.cos(carth);
    let sth = Math.sin(carth);
    let along = cth * tx + sth * ty;
    let across = -sth * tx + cth * ty;
    let targv = Math.max(0, along * speedlimit / controlrad);
    let actualv = cardx * cth + cardy * sth;
    let accel = Math.max(-3, Math.min(2, (targv - actualv) * 20));
    along = Math.max(0.3, along);
    let radperdist = 2 * across / (along**2 + across**2); // signed inverse of desired turning radius
    radperdist = Math.max(-maxturn, Math.min(maxturn, radperdist));
    let dth = actualv * radperdist;
    this.step(-100*dth, accel);
}

// shift a point in course coordinates to "spectator view": centered on car, and rotated so that screen up == positive Y
Car.prototype.spectatorCoords = function(x, y) {
    return [-(y - this.y), -(x - this.x)];
}

// render current state to a pre-existing SVG; arguments are references to SVG nodes for the car and the whole course
Car.prototype.renderSVG = function(carNode, everythingNode) {
    let a = carsize * Math.cos(this.th);
    let b = carsize * Math.sin(this.th);
    carNode.style.transform = `matrix(${a},${b},${-b},${a},${this.x},${this.y})`;
    e = -(zoom * this.x) + 100;
    f = -(zoom * this.y) + 150;
    everythingNode.style.transform = `matrix(${zoom},0,0,${zoom},${e},${f})`;
}

// convert an SVG to a raster image, represented as a Promise of an ImageData object
// e.g., rasterize(gameview).then(img => ctx.putImageData(img, 0, 0));
// where ctx is the output of Canvas.getContext("2d")
function rasterize(svg, imgsize) {
    var svgimg = document.createElement("img");
    svgimg.src = "data:image/svg+xml;base64," + btoa(new XMLSerializer().serializeToString(svg));
    var svgcanvas = document.createElement("canvas");
    svgcanvas.width = imgsize;
    svgcanvas.height = imgsize;
    var ctx = svgcanvas.getContext("2d");
    return svgimg.decode().then(() => { 
        ctx.drawImage(svgimg, 0, 0, imgsize, imgsize); 
        return ctx.getImageData(0, 0, imgsize, imgsize); 
    });
}

// transform screen coordinates to coodinates on the course
function screen2course(x, y) {
    let pt = new DOMPoint(x, y);
    let newpt = pt.matrixTransform(everything.getScreenCTM().inverse());
    return [newpt.x, newpt.y];
}

var mousex = 0;
var mousey = 0;
var gamepad = null;
var paused = true;

// for recording
var recording = false;
var state = new Car();
var recorded = [];
var didreset = false;
const saveimgsize = 32;
monitor.width = saveimgsize;
monitor.height = saveimgsize;

// for lag injection
var injectlag = false;
var lagfreq = parseFloat(document.getElementById("lagfreq").value);
var laglen = parseFloat(document.getElementById("laglen").value);
var savetx, savety, savedat;
var lagleft = 0;
var nextlag = 0;

// for noise injection
var injectnoise = document.getElementById("noise").checked;
var noisescale = parseFloat(document.getElementById("noisescale").value);
const noisefilter = 0.95;
var nx = 0, ny = 0;

// for predictions
var showpreds = document.getElementById("preds").checked
var net = null;
ort.InferenceSession.create(driving_model).then((r) => net = r).catch((e) => console.log(e));
var pred_x = null;
var pred_y = null;
var saved_frames = [];
var saved_acts = [];
const history_length = 5;
for (let i = 0; i < history_length; i++) {
    saved_frames.push(new ort.Tensor(new Float32Array(saveimgsize**2)).reshape([1, saveimgsize, saveimgsize]));
    saved_acts.push(new ort.Tensor(new Float32Array(2)).reshape([1, 2]));
}

// for ML driving assistance
var selfdrive = document.getElementById("self-driving").checked
var lagassist = document.getElementById("lag-assist").checked

function toggleRecording(ev) {
    recording = !recording;
    if (recording) {
        ev.target.textContent = "\u23F9 Stop Rec.";
    } else {
        ev.target.textContent = "\u23FA Record";
    }
}
function updateMonitors(x, y, ax, ay, img) {
    // relative mouse position display
    actdisplay.style.cx = x * 15 / controlrad;
    actdisplay.style.cy = -y * 15 / controlrad;
    monitor.getContext("2d").putImageData(img, 0, 0);
    if (recording) {
        recorded.push([Date.now(), speedlimit, lagleft, x, y, ax, ay, didreset, img]);
        didreset = false;
    }
    if (showpreds) {
        if (pred_x && pred_y) {
            // relative mouse position prediction display
            preddisplay.style.cx = pred_x * 15 / controlrad;
            preddisplay.style.cy = -pred_y * 15 / controlrad;
        }
    }
}
function to_gray(img) {
    var grayscale = [];
    for (let i = 0; i < img.data.length; i += 4) {
        grayscale.push((img.data[i] + img.data[i+1] + img.data[i+2]) / (255*3));
    }
    return new ort.Tensor(Float32Array.from(grayscale)).reshape([1, saveimgsize, saveimgsize]);
}
function save_frame(img, ax, ay) {
    saved_frames.push(img);
    if (saved_frames.length > history_length) {
        saved_frames = saved_frames.slice(-history_length);
    }
    saved_acts.push(new ort.Tensor(Float32Array.from([ax, ay])).reshape([1, 2]));
    if (saved_acts.length > history_length) {
        saved_acts = saved_acts.slice(-history_length);
    }
}
function updatePredictions(img) {
    if (selfdrive || lagassist || showpreds) {
        if (net) {
            let inputs = {
                f0: saved_frames[1], 
                f1: saved_frames[2], 
                f2: saved_frames[3], 
                f3: saved_frames[4], 
                f4: img,
                a0: saved_acts[1], 
                a1: saved_acts[2], 
                a2: saved_acts[3], 
                a3: saved_acts[4]
            };
            return net.run(inputs).then((res) => { 
                pred_x = res.act.data[0]; 
                pred_y = res.act.data[1];
                let norm = Math.sqrt(pred_x**2 + pred_y**2);
                if (norm > controlrad) {
                    pred_x *= controlrad / norm;
                    pred_y *= controlrad / norm;
                }
                return [pred_x, pred_y];
            });
        }
    }
    pred_x = 0;
    pred_y = 0;
    return new Promise(f => f([0, 0]));
}
function handleNewgame(ev) {
    state.reset();
    state.renderSVG(car, everything);
    didreset = true;
}

function saveAndClear(ev) {
    var converted = ['[\n'];
    converted.push('{"version": "v0.1", "time": 0, "speedlimit": 1, "lag_left": 2, "expert_x": 3, "expert_y": 4, "applied_x": 5, "applied_y": 6, "reset": 7, "img": 8},\n');
    recorded.forEach(frame => {
        converted.push('[', frame[0], ', ', frame[1], ', ', frame[2], ', ', frame[3], ', ', frame[4], ', ', frame[5], ', ', frame[6], ', ', frame[7], ', [', frame[8].data.toString(), ']]', ',\n');
    });
    converted.pop(); // remove final comma
    converted.push(']\n');
    const anchor = document.createElement('a');
    anchor.setAttribute('download', 'driving-data.json');
    // anchor.setAttribute('target', '_blank');
    const blob = new Blob(converted); //, {type: 'application/json'});
    anchor.href = URL.createObjectURL(blob);
    anchor.click();
    recorded = [];
    URL.revokeObjectURL(blob);
    document.getElementById("bufsize").innerText = "0";
}
function handleClick(ev) {
    paused = !paused;
    if (paused) {
        document.getElementById("pausetext").style.fill = "white";
        document.getElementById("bufsize").innerText = recorded.length.toString();
        // document.exitPointerLock();
        chronometer_pause_start = Date.now();
      } else {
        chronometer_pause_offset += (Date.now() - chronometer_pause_start)
        chronometer_pause_offset_since_last_gate += (Date.now() - chronometer_pause_start)
        document.getElementById("pausetext").style.fill = "none";
        // gameview.requestPointerLock();
        mousex = ev.x;
        mousey = ev.y;
        picknextlag(Date.now());
        animate();
    }
}
function handleMove(ev) {
    if (!paused) {
        mousex = ev.x;
        mousey = ev.y;
    }
}
function picknextlag(now) {
    if (injectlag) {
        lagleft = 0;
        nextlag = now + (.667 + Math.random()**2) * lagfreq * 1000;
    }
}
function animate() {
    if (!paused) {
        rasterize(gameview, saveimgsize).then(img => {
            let [cx, cy] = screen2course(mousex, mousey);
            let [tx, ty] = state.spectatorCoords(cx, cy);
            let tnorm = Math.sqrt(tx**2 + ty**2);
            if (tnorm > controlrad) {
                tx /= tnorm/controlrad;
                ty /= tnorm/controlrad;
            }
            let applytx = tx;
            let applyty = ty;
            let now = Date.now();
            let grayimg = to_gray(img);
            updatePredictions(grayimg).then(([px, py]) => {
                if (selfdrive) {
                    tx = py;
                    ty = -px;
                    applytx = tx;
                    applyty = ty;
                }
                if (!injectlag || lagleft == 0) {
                    savetx = tx;
                    savety = ty;
                    savedat = Date.now();
                } else {
                    let elapsed = now - savedat;
                    applytx = savetx;
                    applyty = savety;
                    savedat = now;
                    lagleft = Math.max(0, lagleft - elapsed);
                    if (lagassist && pred_x && pred_y) {
                        applytx = pred_y;
                        applyty = -pred_x;
                    }
                }
                if (injectlag && now >= nextlag) {
                    picknextlag(now);
                    lagleft = (.667 + Math.random()**2) * laglen;
                }
                if (injectnoise) {
                    nx = noisefilter * nx + (1-noisefilter) * randn();
                    ny = noisefilter * ny + (1-noisefilter) * randn();
                    applytx += 2 * nx * noisescale;
                    applyty += 2 * ny * noisescale;
                    let norm = Math.sqrt(applytx**2 + applyty**2);
                    if (norm > controlrad) {
                        applytx *= controlrad / norm;
                        applyty *= controlrad / norm;
                    }
                }
                state.step2(applytx, applyty);
                state.renderSVG(car, everything);
                save_frame(grayimg, -applyty, applytx);
                updateMonitors(-ty, tx, -applyty, applytx, img);
                requestAnimationFrame(animate);
            });
        }).catch(e => console.log(e));
    }
}
function randn() {
    let u = Math.random();
    let v = Math.random();
    return Math.sqrt(-2.0 * Math.log(1.0-u)) * Math.cos(2.0 * Math.PI * v);
}

var fps = document.getElementById("fps");
var startTime = Date.now();
var frame = 0;

function tick() {
  var time = Date.now();
  frame++;
  if (time - startTime > 1000) {
      fps.innerHTML = (frame / ((time - startTime) / 1000)).toFixed(1);
      startTime = time;
      frame = 0;
	}
  window.requestAnimationFrame(tick);
}
tick();

gameview.onclick = handleClick;
gameview.onmousemove = handleMove;
document.getElementById("mapSelectBox").onchange = populateStartingPositionBox;
document.getElementById("recordbutton").onclick = toggleRecording;
document.getElementById("newgameButton").onclick = handleNewgame;
document.getElementById("savebutton").onclick = saveAndClear;
document.getElementById("lvl-easy").onchange = (e) => { speedlimit = 0.6; };
document.getElementById("lvl-norm").onchange = (e) => { speedlimit = 0.8; };
document.getElementById("lvl-hard").onchange = (e) => { speedlimit = 1.0; };
document.getElementById("lvl-xhrd").onchange = (e) => { speedlimit = 1.2; };
document.getElementById("bg-random").onchange = (e) => { background_source = "random"; };
document.getElementById("bg-map").onchange = (e) => { background_source = "map"; };
document.getElementById("bg-seed").onchange = (e) => { background_source = "seed"; };
document.getElementById("bg-seed-input").onchange = (e) => { background_seed = e.target.value; };
document.getElementById("lag").onchange = (e) => { injectlag = e.target.checked; }
document.getElementById("lagfreq").onchange = (e) => { lagfreq = parseFloat(e.target.value) || 0; }
document.getElementById("laglen").onchange = (e) => { laglen = parseFloat(e.target.value) || 0; }
document.getElementById("preds").onchange = (e) => { showpreds = e.target.checked; }
document.getElementById("self-driving").onchange = (e) => { selfdrive = e.target.checked; }
document.getElementById("lag-assist").onchange = (e) => { lagassist = e.target.checked; }
document.getElementById("noise").onchange = (e) => { injectnoise = e.target.checked; }
document.getElementById("noisescale").onchange = (e) => { noisescale = parseFloat(e.target.value) || 0; }

populateMapSelectBox()
state.reset()

state.renderSVG(car, everything);

// TO DO
// fix when prediction is updated (currently a frame too late, and we fail to update it at all if it's not shown in monitor)
// fix touch behavior on mobile
// check recording on mobile
// cold start problem: what if there aren't 5 frames of history?
// add option to reset at intervals
// learn a state space and environment model? (w/ DAgger?)
// add some form of lookahead?
// auto-reset if stuck on edge of playing field?
// implement constant base lag? (queue actions for say 50 ms before applying them)
// log which policy is active?
// add a policy-selector menu with a few interesting policies?
